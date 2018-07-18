const series = require('p-series');
const Lazy = require('p-lazy');
const axios = require('axios');
const fs = require('fs');
const Logger = require('loggy');
const rc = require('rc');

const { CORE_DEFINITION_TEMPLATE } = require('../templates/typings');

const generate = (credentials, entity = 'all', options = {}) => {
    let rest = credentials.sessions.find(s => s.name === 'rest').value;
    let config = rc('bullhorn', options);
    let dir = config.directory || './typings';
    return axios(`${rest.endpoint}/meta?&BhRestToken=${rest.token}`)
        .then((res) => res.data)
        .then((list) => {
            let promises = [];
            Logger.log(`retrieving metadata for each entity...`);
            if (entity !== 'all') {
                list = list.filter(i => entity.split(',').indexOf(i.entity) >= 0);
            } else {
                Logger.warn(`(this may take a while)`);
            }
            for (let item of list) {
                promises.push(
                    () => new Lazy((resolve, reject) => {
                        return getMetaData(item, rest)
                            .then(resolve)
                            .catch(reject);
                    })
                );
            }

            return series(promises)
                .then((types) => {
                    Logger.log(`writing templates...`);
                    let deletables = types.filter((i) => i && i.properties.find(p => p.name === 'isDeleted'));
                    let tmp = CORE_DEFINITION_TEMPLATE({ types: types, deletables: deletables });
                    fs.writeFile(`${dir}/index.ts`, tmp, (err) => {
                        if (err) {
                            Logger.error(err.message);
                        }
                        Logger.success(`Done!`);
                    });
                })
                .catch((err) => {
                    Logger.error('✗ An error occurred', err);
                });
        }).catch((err) => {
            Logger.error('✗ An error occurred', err);
        });
}

const getMetaData = (item, access) => {
    return axios(`${item.metaUrl}&meta=full&BhRestToken=${access.token}`)
        .then((res) => res.data)
        .then((meta) => {
            //Logger.spin(`processing entity meta... ${meta.entity}`);
            let data = {
                type: meta.entity,
                properties: [],
                dependencies: new Set(),
                dynamic: false
            };
            let hasCustomObjects = false;
            if (meta.entity.indexOf('CustomObject') >= 0) {
                data.dynamic = true;
            } else {
                for (let field of meta.fields) {
                    if (field.name.indexOf('customObject') === 0) {
                      hasCustomObjects = true;
                    } else if (['id'].indexOf(field.name) < 0) {
                        switch (field.dataType || '') {
                            case 'Integer':
                            case 'Double':
                            case 'Float':
                            case 'BigDecimal':
                                data.properties.push({
                                    name: field.name,
                                    type: 'number'
                                });
                                break;
                            case 'Date':
                            case 'Timestamp':
                                data.properties.push({
                                    name: field.name,
                                    type: 'Date'
                                });
                                break;
                            case 'String':
                                data.properties.push({
                                    name: field.name,
                                    type: 'Strings'
                                });
                                break;
                            case 'Boolean':
                                data.properties.push({
                                    name: field.name,
                                    type: 'boolean'
                                });
                                break;
                            case 'Address':
                            case 'Address1':
                            case 'AddressWithoutCountry':
                                data.properties.push({
                                    name: field.name,
                                    type: 'Address'
                                });
                                break;
                            default:
                                if (field.type === 'TO_MANY') {
                                    data.properties.push({
                                        name: field.name,
                                        type: `ToMany<${field.associatedEntity.entity}>`
                                    });
                                    data.dependencies.add(field.associatedEntity.entity);
                                } else if (field.type === 'TO_ONE') {
                                    data.properties.push({
                                        name: field.name,
                                        type: `${field.associatedEntity.entity}`
                                    });
                                    data.dependencies.add(field.associatedEntity.entity);
                                }
                                break;
                        }
                    }
                }
                if(hasCustomObjects) {
                  let entity = meta.entity.replace(/[0-9]/g, '');
                  entity = ['Candidate', 'ClientContact', 'Lead'].indexOf(entity) < 0 ? entity : 'Person';
                  for ( let i=1; i<=10; i++){
                    data.properties.push({
                      name: `customObject${i}s`,
                      type: `${entity}CustomObjectInstance${i}[]`
                    });
                  }
                }
            }
            return data;
        })
        .catch(err => {
            Logger.error(`failed to retrieve -> ${item.entity}.`, err.message);
            return {
                type: item.entity,
                properties: [],
                dependencies: new Set(),
                dynamic: true
            };
        });
}


// Export all methods
module.exports = {
    generate
};
