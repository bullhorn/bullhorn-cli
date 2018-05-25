const series = require('p-series');
const Lazy = require('p-lazy');
const axios = require('axios');
const fs = require('fs');
const mkdirp = require('mkdirp');
const Logger = require('loggy');
const rc = require('rc');

const { CORE_DEFINITION_TEMPLATE } = require('../templates/typings');

const generate = (entity = 'all', options = {}) => {
    let config = rc('bullhorn', options);
    let env = config.environment || 'https://universal.bullhornstaffing.com';
    let dir = config.directory || './typings';
    mkdirp(dir);
    Logger.log(`authenticating against... ${env}`);
    let access = null;
    //axios.defaults.withCredentials = true;

    return axios(`${env}/universal-login/session/login?username=${config.username}&password=${config.password}`)
        .then((res) => res.data)
        .then((json) => {
            access = json.sessions.find((s) => s.name === 'rest').value;
            Logger.log(`retrieving available entities...`);
            return axios(`${access.endpoint}/meta?&BhRestToken=${access.token}`);
        })
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
                        return getMetaData(item, access)
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
            if (meta.entity.indexOf('CustomObject') >= 0) {
                data.dynamic = true;
            } else {
                for (let field of meta.fields) {
                    if (['id'].indexOf(field.name) < 0) {
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
                                        type: `${field.associatedEntity.entity}[]`
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