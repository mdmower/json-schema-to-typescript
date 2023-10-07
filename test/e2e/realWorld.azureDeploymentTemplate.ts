export const options = {
  format: false,
}

export const input = {
  id: 'https://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#',
  $schema: 'http://json-schema.org/draft-04/schema#',
  title: 'Template',
  description: 'An Azure deployment template',
  type: 'object',
  properties: {
    $schema: {type: 'string', description: 'JSON schema reference'},
    metadata: {
      type: 'object',
      description: 'Additional unstructured metadata to include with the template deployment.',
      additionalProperties: true,
    },
    apiProfile: {
      type: 'string',
      enum: ['2017-03-09-profile', '2018-03-01-hybrid', '2018-06-01-profile', '2019-03-01-hybrid'],
      description: 'The apiProfile to use for all resources in the template.',
    },
    contentVersion: {
      type: 'string',
      pattern: '(^[0-9]+\\.[0-9]+\\.[0-9]+\\.[0-9]+$)',
      description: 'A 4 number format for the version number of this template file. For example, 1.0.0.0',
    },
    variables: {type: 'object', description: 'Variable definitions'},
    parameters: {
      type: 'object',
      description: 'Input parameter definitions',
      additionalProperties: {$ref: '#/definitions/parameter'},
    },
    functions: {type: 'array', items: {$ref: '#/definitions/functionNamespace'}, description: 'User defined functions'},
    resources: {
      description: 'Collection of resources to be deployed',
      oneOf: [
        {$ref: '#/definitions/resourcesWithoutSymbolicNames'},
        {$ref: '#/definitions/resourcesWithSymbolicNames'},
      ],
    },
    outputs: {
      type: 'object',
      description: 'Output parameter definitions',
      additionalProperties: {$ref: '#/definitions/output'},
    },
  },
  additionalProperties: false,
  required: ['$schema', 'contentVersion', 'resources'],
  definitions: {
    ARMResourceBase: {
      type: 'object',
      properties: {
        name: {type: 'string', description: 'Name of the resource'},
        type: {type: 'string', description: 'Resource type'},
        condition: {
          oneOf: [
            {type: 'boolean'},
            {$ref: 'https://schema.management.azure.com/schemas/common/definitions.json#/definitions/expression'},
          ],
          description: 'Condition of the resource',
        },
        apiVersion: {
          type: 'string',
          description: 'API Version of the resource type, optional when apiProfile is used on the template',
        },
        dependsOn: {
          type: 'array',
          items: {type: 'string'},
          description: 'Collection of resources this resource depends on',
        },
      },
      required: ['name', 'type'],
    },
    proxyResourceBase: {
      allOf: [
        {$ref: '#/definitions/ARMResourceBase'},
        {
          properties: {
            location: {$ref: '#/definitions/resourceLocations', description: 'Location to deploy resource to'},
          },
        },
      ],
    },
    resourceBase: {
      allOf: [
        {$ref: '#/definitions/ARMResourceBase'},
        {
          properties: {
            location: {$ref: '#/definitions/resourceLocations', description: 'Location to deploy resource to'},
            tags: {type: 'object', description: 'Name-value pairs to add to the resource'},
            copy: {$ref: '#/definitions/resourceCopy'},
            scope: {
              type: 'string',
              description:
                'Scope for the resource or deployment. Today, this works for two cases: 1) setting the scope for extension resources 2) deploying resources to the tenant scope in non-tenant scope deployments',
            },
            comments: {type: 'string'},
          },
        },
      ],
    },
    resourceBaseExternal: {$ref: '#/definitions/resourceBase', required: ['plan']},
    resourceSku: {
      type: 'object',
      properties: {
        name: {type: 'string', description: 'Name of the sku'},
        tier: {type: 'string', description: 'Tier of the sku'},
        size: {type: 'string', description: 'Size of the sku'},
        family: {type: 'string', description: 'Family of the sku'},
        capacity: {type: 'integer', description: 'Capacity of the sku'},
      },
      required: ['name'],
    },
    resourceCopy: {
      type: 'object',
      properties: {
        name: {type: 'string', description: 'Name of the copy'},
        count: {
          oneOf: [
            {$ref: 'https://schema.management.azure.com/schemas/common/definitions.json#/definitions/expression'},
            {type: 'integer'},
          ],
          description: 'Count of the copy',
        },
        mode: {type: 'string', enum: ['Parallel', 'Serial'], description: 'The copy mode'},
        batchSize: {
          oneOf: [
            {$ref: 'https://schema.management.azure.com/schemas/common/definitions.json#/definitions/expression'},
            {type: 'integer'},
          ],
          description: 'The serial copy batch size',
        },
      },
    },
    resourceKind: {type: 'string', maxLength: 64, pattern: '(^[a-zA-Z0-9_.()-]+$)', description: 'Kind of resource'},
    resourcePlan: {
      type: 'object',
      properties: {
        name: {type: 'string', description: 'Name of the plan'},
        promotionCode: {type: 'string', description: 'Plan promotion code'},
        publisher: {type: 'string', description: 'Name of the publisher'},
        product: {type: 'string', description: 'Name of the product'},
        version: {type: 'string', description: 'Version of the product'},
      },
      required: ['name'],
      description: 'Plan of the resource',
    },
    resourceLocations: {
      anyOf: [
        {type: 'string'},
        {
          enum: [
            'East Asia',
            'Southeast Asia',
            'Central US',
            'East US',
            'East US 2',
            'West US',
            'North Central US',
            'South Central US',
            'North Europe',
            'West Europe',
            'Japan West',
            'Japan East',
            'Brazil South',
            'Australia East',
            'Australia Southeast',
            'Central India',
            'West India',
            'South India',
            'Canada Central',
            'Canada East',
            'West Central US',
            'West US 2',
            'UK South',
            'UK West',
            'Korea Central',
            'Korea South',
            'global',
          ],
        },
      ],
    },
    functionNamespace: {
      type: 'object',
      properties: {
        namespace: {type: 'string', minLength: 1, description: 'Function namespace'},
        members: {
          type: 'object',
          additionalProperties: {$ref: '#/definitions/functionMember'},
          description: 'Function members',
        },
      },
    },
    functionMember: {
      type: 'object',
      properties: {
        parameters: {
          type: 'array',
          items: {$ref: '#/definitions/functionParameter'},
          description: 'Function parameters',
        },
        output: {$ref: '#/definitions/functionOutput', description: 'Function output'},
      },
    },
    functionParameter: {
      type: 'object',
      properties: {
        name: {type: 'string', minLength: 1, description: 'Function parameter name'},
        type: {$ref: '#/definitions/parameterTypes', description: 'Type of function parameter value'},
      },
    },
    functionOutput: {
      type: 'object',
      properties: {
        type: {$ref: '#/definitions/parameterTypes', description: 'Type of function output value'},
        value: {$ref: '#/definitions/parameterValueTypes', description: 'Value assigned for function output'},
      },
    },
    parameter: {
      type: 'object',
      properties: {
        type: {$ref: '#/definitions/parameterTypes', description: 'Type of input parameter'},
        defaultValue: {
          $ref: '#/definitions/parameterValueTypes',
          description: 'Default value to be used if one is not provided',
        },
        allowedValues: {type: 'array', description: 'Value can only be one of these values'},
        metadata: {type: 'object', description: 'Metadata for the parameter, can be any valid JSON object'},
        minValue: {type: 'integer', description: 'Minimum value for the int type parameter'},
        maxValue: {type: 'integer', description: 'Maximum value for the int type parameter'},
        minLength: {type: 'integer', description: 'Minimum length for the string or array type parameter'},
        maxLength: {type: 'integer', description: 'Maximum length for the string or array type parameter'},
      },
      required: ['type'],
      description: 'Input parameter definitions',
    },
    output: {
      type: 'object',
      properties: {
        condition: {
          oneOf: [
            {type: 'boolean'},
            {$ref: 'https://schema.management.azure.com/schemas/common/definitions.json#/definitions/expression'},
          ],
          description: 'Condition of the output',
        },
        type: {$ref: '#/definitions/parameterTypes', description: 'Type of output value'},
        value: {$ref: '#/definitions/parameterValueTypes', description: 'Value assigned for output'},
        copy: {$ref: '#/definitions/outputCopy', description: 'Output copy'},
      },
      required: ['type'],
      description: 'Set of output parameters',
    },
    parameterTypes: {enum: ['string', 'securestring', 'int', 'bool', 'object', 'secureObject', 'array']},
    parameterValueTypes: {type: ['string', 'boolean', 'integer', 'number', 'object', 'array', 'null']},
    keyVaultReference: {
      type: 'object',
      properties: {
        keyVault: {
          type: 'object',
          properties: {id: {type: 'string', minLength: 1}},
          required: ['id'],
          additionalProperties: false,
        },
        secretName: {type: 'string', minLength: 1},
        secretVersion: {type: 'string', minLength: 1},
      },
      required: ['keyVault', 'secretName'],
      additionalProperties: false,
    },
    outputCopy: {
      type: 'object',
      properties: {
        count: {
          oneOf: [
            {$ref: 'https://schema.management.azure.com/schemas/common/definitions.json#/definitions/expression'},
            {type: 'integer'},
          ],
          description: 'Count of the copy',
        },
        input: {
          anyOf: [
            {type: ['string', 'boolean', 'integer', 'array', 'object', 'null']},
            {$ref: 'https://schema.management.azure.com/schemas/common/definitions.json#/definitions/expression'},
          ],
          description: 'Input of the copy',
        },
      },
      required: ['count', 'input'],
      description: 'Output copy',
    },
    resource: {
      description: 'Collection of resource schemas',
      oneOf: [
        {
          allOf: [
            {$ref: '#/definitions/resourceBase'},
            {
              oneOf: [
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-16/Microsoft.HealthcareApis.json#/resourceDefinitions/services',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-02-01-preview/Microsoft.AppConfiguration.json#/resourceDefinitions/configurationStores',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-08-20-preview/Microsoft.HealthcareApis.json#/resourceDefinitions/services',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-08-01-preview/Microsoft.Genomics.json#/resourceDefinitions/accounts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-03-01/Microsoft.Network.FrontDoor.json#/resourceDefinitions/FrontDoorWebApplicationFirewallPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Network.FrontDoor.json#/resourceDefinitions/frontDoors',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-05-01/Microsoft.Network.FrontDoor.json#/resourceDefinitions/frontDoors',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-10-01/Microsoft.Network.FrontDoor.json#/resourceDefinitions/FrontDoorWebApplicationFirewallPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.FrontDoor.json#/resourceDefinitions/NetworkExperimentProfiles',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.FrontDoor.json#/resourceDefinitions/NetworkExperimentProfiles_Experiments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-01-01/Microsoft.Network.FrontDoor.json#/resourceDefinitions/frontDoors',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-01-01/Microsoft.Network.FrontDoor.json#/resourceDefinitions/frontDoors_rulesEngines',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-10-01/Microsoft.Cache.json#/resourceDefinitions/Redis',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-10-01/Microsoft.Cache.json#/resourceDefinitions/Redis_firewallRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-10-01/Microsoft.Cache.json#/resourceDefinitions/Redis_linkedServers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-10-01/Microsoft.Cache.json#/resourceDefinitions/Redis_patchSchedules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-19/Microsoft.Search.json#/resourceDefinitions/searchServices',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-05-16/Microsoft.AnalysisServices.json#/resourceDefinitions/servers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-08-01/Microsoft.AnalysisServices.json#/resourceDefinitions/servers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-06-01/Microsoft.RecoveryServices.json#/resourceDefinitions/vaults',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-06-01/Microsoft.RecoveryServices.legacy.json#/resourceDefinitions/vaults',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-06-01/Microsoft.RecoveryServices.json#/resourceDefinitions/vaults_certificates',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-06-01/Microsoft.RecoveryServices.json#/resourceDefinitions/vaults_extendedInformation',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-04-08/Microsoft.DocumentDB.json#/resourceDefinitions/databaseAccounts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-04-08/Microsoft.DocumentDB.json#/resourceDefinitions/databaseAccounts_apis_databases',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-04-08/Microsoft.DocumentDB.json#/resourceDefinitions/databaseAccounts_apis_databases_collections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-04-08/Microsoft.DocumentDB.json#/resourceDefinitions/databaseAccounts_apis_databases_containers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-04-08/Microsoft.DocumentDB.json#/resourceDefinitions/databaseAccounts_apis_databases_graphs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-04-08/Microsoft.DocumentDB.json#/resourceDefinitions/databaseAccounts_apis_keyspaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-04-08/Microsoft.DocumentDB.json#/resourceDefinitions/databaseAccounts_apis_keyspaces_tables',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-04-08/Microsoft.DocumentDB.json#/resourceDefinitions/databaseAccounts_apis_tables',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-04-08/Microsoft.DocumentDB.json#/resourceDefinitions/databaseAccounts_apis_databases_collections_settings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-04-08/Microsoft.DocumentDB.json#/resourceDefinitions/databaseAccounts_apis_databases_containers_settings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-04-08/Microsoft.DocumentDB.json#/resourceDefinitions/databaseAccounts_apis_databases_graphs_settings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-04-08/Microsoft.DocumentDB.json#/resourceDefinitions/databaseAccounts_apis_keyspaces_settings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-04-08/Microsoft.DocumentDB.json#/resourceDefinitions/databaseAccounts_apis_keyspaces_tables_settings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-04-08/Microsoft.DocumentDB.json#/resourceDefinitions/databaseAccounts_apis_tables_settings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-06-01/Microsoft.KeyVault.Secrets.json#/resourceDefinitions/vaults_secrets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-06-01/Microsoft.KeyVault.json#/resourceDefinitions/vaults',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-10-01/Microsoft.KeyVault.json#/resourceDefinitions/vaults',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-10-01/Microsoft.KeyVault.json#/resourceDefinitions/vaults_accessPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-10-01/Microsoft.KeyVault.json#/resourceDefinitions/vaults_secrets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-14/Microsoft.KeyVault.json#/resourceDefinitions/vaults',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-14/Microsoft.KeyVault.json#/resourceDefinitions/vaults_accessPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-14/Microsoft.KeyVault.json#/resourceDefinitions/vaults_privateEndpointConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-14/Microsoft.KeyVault.json#/resourceDefinitions/vaults_secrets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-14-preview/Microsoft.KeyVault.json#/resourceDefinitions/vaults',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-14-preview/Microsoft.KeyVault.json#/resourceDefinitions/vaults_accessPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-14-preview/Microsoft.KeyVault.json#/resourceDefinitions/vaults_secrets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.KeyVault.json#/resourceDefinitions/vaults',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.KeyVault.json#/resourceDefinitions/vaults_accessPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.KeyVault.json#/resourceDefinitions/vaults_keys',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.KeyVault.json#/resourceDefinitions/vaults_privateEndpointConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.KeyVault.json#/resourceDefinitions/vaults_secrets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01-preview/Microsoft.KeyVault.json#/resourceDefinitions/managedHSMs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01-preview/Microsoft.KeyVault.json#/resourceDefinitions/vaults',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01-preview/Microsoft.KeyVault.json#/resourceDefinitions/vaults_accessPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01-preview/Microsoft.KeyVault.json#/resourceDefinitions/vaults_privateEndpointConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01-preview/Microsoft.KeyVault.json#/resourceDefinitions/vaults_secrets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-05-15/Microsoft.DevTestLab.json#/resourceDefinitions/labs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-05-15/Microsoft.DevTestLab.json#/resourceDefinitions/labs_artifactsources',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-05-15/Microsoft.DevTestLab.json#/resourceDefinitions/labs_customimages',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-05-15/Microsoft.DevTestLab.json#/resourceDefinitions/labs_formulas',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-05-15/Microsoft.DevTestLab.json#/resourceDefinitions/labs_policysets_policies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-05-15/Microsoft.DevTestLab.json#/resourceDefinitions/labs_schedules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-05-15/Microsoft.DevTestLab.json#/resourceDefinitions/labs_virtualmachines',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-05-15/Microsoft.DevTestLab.json#/resourceDefinitions/labs_virtualnetworks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-05-15/Microsoft.DevTestLab.json#/resourceDefinitions/labs_costs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-05-15/Microsoft.DevTestLab.json#/resourceDefinitions/labs_notificationchannels',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-05-15/Microsoft.DevTestLab.json#/resourceDefinitions/labs_servicerunners',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-05-15/Microsoft.DevTestLab.json#/resourceDefinitions/labs_users',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-05-15/Microsoft.DevTestLab.json#/resourceDefinitions/labs_virtualmachines_schedules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-05-15/Microsoft.DevTestLab.json#/resourceDefinitions/labs_users_disks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-05-15/Microsoft.DevTestLab.json#/resourceDefinitions/labs_users_environments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-05-15/Microsoft.DevTestLab.json#/resourceDefinitions/labs_users_secrets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-10/Microsoft.RecoveryServices.SiteRecovery.json#/resourceDefinitions/vaults_replicationAlertSettings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-10/Microsoft.RecoveryServices.SiteRecovery.json#/resourceDefinitions/vaults_replicationFabrics',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-10/Microsoft.RecoveryServices.SiteRecovery.json#/resourceDefinitions/vaults_replicationFabrics_replicationNetworks_replicationNetworkMappings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-10/Microsoft.RecoveryServices.SiteRecovery.json#/resourceDefinitions/vaults_replicationFabrics_replicationProtectionContainers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-10/Microsoft.RecoveryServices.SiteRecovery.json#/resourceDefinitions/vaults_replicationFabrics_replicationProtectionContainers_replicationMigrationItems',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-10/Microsoft.RecoveryServices.SiteRecovery.json#/resourceDefinitions/vaults_replicationFabrics_replicationProtectionContainers_replicationProtectedItems',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-10/Microsoft.RecoveryServices.SiteRecovery.json#/resourceDefinitions/vaults_replicationFabrics_replicationProtectionContainers_replicationProtectionContainerMappings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-10/Microsoft.RecoveryServices.SiteRecovery.json#/resourceDefinitions/vaults_replicationFabrics_replicationRecoveryServicesProviders',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-10/Microsoft.RecoveryServices.SiteRecovery.json#/resourceDefinitions/vaults_replicationFabrics_replicationStorageClassifications_replicationStorageClassificationMappings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-10/Microsoft.RecoveryServices.SiteRecovery.json#/resourceDefinitions/vaults_replicationFabrics_replicationvCenters',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-10/Microsoft.RecoveryServices.SiteRecovery.json#/resourceDefinitions/vaults_replicationPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-10/Microsoft.RecoveryServices.SiteRecovery.json#/resourceDefinitions/vaults_replicationRecoveryPlans',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01-preview/Microsoft.DigitalTwins.json#/resourceDefinitions/digitalTwinsInstances',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01-preview/Microsoft.DigitalTwins.json#/resourceDefinitions/digitalTwinsInstances_endpoints',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-05-21-preview/Microsoft.DevTestLab.json#/resourceDefinitions/labs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-05-21-preview/Microsoft.DevTestLab.json#/resourceDefinitions/labs_virtualmachines',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-09-07-privatepreview/Microsoft.Kusto.json#/resourceDefinitions/clusters',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-09-07-privatepreview/Microsoft.Kusto.json#/resourceDefinitions/clusters_databases',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-09-07-preview/Microsoft.Kusto.json#/resourceDefinitions/clusters',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-09-07-preview/Microsoft.Kusto.json#/resourceDefinitions/clusters_databases',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-01-21/Microsoft.Kusto.json#/resourceDefinitions/clusters',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-01-21/Microsoft.Kusto.json#/resourceDefinitions/clusters_databases',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-01-21/Microsoft.Kusto.json#/resourceDefinitions/clusters_databases_dataConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-05-15/Microsoft.Kusto.json#/resourceDefinitions/clusters',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-05-15/Microsoft.Kusto.json#/resourceDefinitions/clusters_databases',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-05-15/Microsoft.Kusto.json#/resourceDefinitions/clusters_databases_dataConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-07/Microsoft.Kusto.json#/resourceDefinitions/clusters',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-07/Microsoft.Kusto.json#/resourceDefinitions/clusters_databases',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-07/Microsoft.Kusto.json#/resourceDefinitions/clusters_databases_dataConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-07/Microsoft.Kusto.json#/resourceDefinitions/clusters_attachedDatabaseConfigurations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-09/Microsoft.Kusto.json#/resourceDefinitions/clusters',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-09/Microsoft.Kusto.json#/resourceDefinitions/clusters_databases',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-09/Microsoft.Kusto.json#/resourceDefinitions/clusters_databases_dataConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-09/Microsoft.Kusto.json#/resourceDefinitions/clusters_attachedDatabaseConfigurations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-09/Microsoft.Kusto.json#/resourceDefinitions/clusters_dataConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-09/Microsoft.Kusto.json#/resourceDefinitions/clusters_principalAssignments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-09/Microsoft.Kusto.json#/resourceDefinitions/clusters_databases_principalAssignments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-02-15/Microsoft.Kusto.json#/resourceDefinitions/clusters',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-02-15/Microsoft.Kusto.json#/resourceDefinitions/clusters_databases',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-02-15/Microsoft.Kusto.json#/resourceDefinitions/clusters_databases_dataConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-02-15/Microsoft.Kusto.json#/resourceDefinitions/clusters_attachedDatabaseConfigurations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-02-15/Microsoft.Kusto.json#/resourceDefinitions/clusters_dataConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-02-15/Microsoft.Kusto.json#/resourceDefinitions/clusters_principalAssignments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-02-15/Microsoft.Kusto.json#/resourceDefinitions/clusters_databases_principalAssignments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-14/Microsoft.Kusto.json#/resourceDefinitions/clusters',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-14/Microsoft.Kusto.json#/resourceDefinitions/clusters_databases',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-14/Microsoft.Kusto.json#/resourceDefinitions/clusters_databases_dataConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-14/Microsoft.Kusto.json#/resourceDefinitions/clusters_attachedDatabaseConfigurations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-14/Microsoft.Kusto.json#/resourceDefinitions/clusters_dataConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-14/Microsoft.Kusto.json#/resourceDefinitions/clusters_principalAssignments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-14/Microsoft.Kusto.json#/resourceDefinitions/clusters_databases_principalAssignments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-18/Microsoft.Kusto.json#/resourceDefinitions/clusters',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-18/Microsoft.Kusto.json#/resourceDefinitions/clusters_databases',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-18/Microsoft.Kusto.json#/resourceDefinitions/clusters_databases_dataConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-18/Microsoft.Kusto.json#/resourceDefinitions/clusters_attachedDatabaseConfigurations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-18/Microsoft.Kusto.json#/resourceDefinitions/clusters_dataConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-18/Microsoft.Kusto.json#/resourceDefinitions/clusters_principalAssignments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-18/Microsoft.Kusto.json#/resourceDefinitions/clusters_databases_principalAssignments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2014-04-01-preview/Microsoft.Cache.json#/resourceDefinitions/Redis',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-04-01/Microsoft.NotificationHubs.json#/resourceDefinitions/namespaces_notificationHubs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-04-01/Microsoft.NotificationHubs.json#/resourceDefinitions/namespaces_notificationHubs_AuthorizationRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-01/Microsoft.Cache.json#/resourceDefinitions/Redis',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-11-01/Microsoft.Network.json#/resourceDefinitions/trafficManagerProfiles',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01/Microsoft.Network.json#/resourceDefinitions/trafficManagerProfiles',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-05-01/Microsoft.Network.json#/resourceDefinitions/trafficManagerProfiles',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-04-01/Microsoft.Network.json#/resourceDefinitions/trafficManagerProfiles',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-01/Microsoft.Storage.json#/resourceDefinitions/storageAccounts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-01-01/Microsoft.Storage.json#/resourceDefinitions/storageAccounts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-06-01/Microsoft.Storage.json#/resourceDefinitions/storageAccounts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-10-01/Microsoft.Storage.json#/resourceDefinitions/storageAccounts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Storage.json#/resourceDefinitions/storageAccounts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Storage.json#/resourceDefinitions/storageAccounts_blobServices_containers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Storage.json#/resourceDefinitions/storageAccounts_blobServices_containers_immutabilityPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-03-01-preview/Microsoft.Storage.json#/resourceDefinitions/storageAccounts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-03-01-preview/Microsoft.Storage.json#/resourceDefinitions/storageAccounts_managementPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-03-01-preview/Microsoft.Storage.json#/resourceDefinitions/storageAccounts_blobServices_containers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-03-01-preview/Microsoft.Storage.json#/resourceDefinitions/storageAccounts_blobServices_containers_immutabilityPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-07-01/Microsoft.Storage.json#/resourceDefinitions/storageAccounts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-07-01/Microsoft.Storage.json#/resourceDefinitions/storageAccounts_blobServices',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-07-01/Microsoft.Storage.json#/resourceDefinitions/storageAccounts_blobServices_containers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-07-01/Microsoft.Storage.json#/resourceDefinitions/storageAccounts_blobServices_containers_immutabilityPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Storage.json#/resourceDefinitions/storageAccounts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Storage.json#/resourceDefinitions/storageAccounts_blobServices',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Storage.json#/resourceDefinitions/storageAccounts_blobServices_containers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Storage.json#/resourceDefinitions/storageAccounts_blobServices_containers_immutabilityPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Storage.json#/resourceDefinitions/storageAccounts_managementPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Storage.json#/resourceDefinitions/storageAccounts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Storage.json#/resourceDefinitions/storageAccounts_blobServices',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Storage.json#/resourceDefinitions/storageAccounts_blobServices_containers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Storage.json#/resourceDefinitions/storageAccounts_blobServices_containers_immutabilityPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Storage.json#/resourceDefinitions/storageAccounts_managementPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Storage.json#/resourceDefinitions/storageAccounts_fileServices',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Storage.json#/resourceDefinitions/storageAccounts_fileServices_shares',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Storage.json#/resourceDefinitions/storageAccounts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Storage.json#/resourceDefinitions/storageAccounts_blobServices',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Storage.json#/resourceDefinitions/storageAccounts_blobServices_containers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Storage.json#/resourceDefinitions/storageAccounts_blobServices_containers_immutabilityPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Storage.json#/resourceDefinitions/storageAccounts_fileServices',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Storage.json#/resourceDefinitions/storageAccounts_fileServices_shares',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Storage.json#/resourceDefinitions/storageAccounts_managementPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Storage.json#/resourceDefinitions/storageAccounts_privateEndpointConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Storage.json#/resourceDefinitions/storageAccounts_encryptionScopes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Storage.json#/resourceDefinitions/storageAccounts_objectReplicationPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Storage.json#/resourceDefinitions/storageAccounts_queueServices',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Storage.json#/resourceDefinitions/storageAccounts_queueServices_queues',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Storage.json#/resourceDefinitions/storageAccounts_tableServices',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Storage.json#/resourceDefinitions/storageAccounts_tableServices_tables',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Storage.json#/resourceDefinitions/storageAccounts_inventoryPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.VMwareCloudSimple.json#/resourceDefinitions/dedicatedCloudNodes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.VMwareCloudSimple.json#/resourceDefinitions/dedicatedCloudServices',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.VMwareCloudSimple.json#/resourceDefinitions/virtualMachines',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-01/Microsoft.Compute.json#/resourceDefinitions/availabilitySets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-01/Microsoft.Compute.json#/resourceDefinitions/extensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-01/Microsoft.Compute.json#/resourceDefinitions/virtualMachineScaleSets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2014-08-01-preview/Microsoft.Scheduler.json#/resourceDefinitions/jobCollections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-01/Microsoft.Compute.json#/resourceDefinitions/virtualMachines',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-10-01-preview/Microsoft.DataLakeStore.json#/resourceDefinitions/accounts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-11-01/Microsoft.DataLakeStore.json#/resourceDefinitions/accounts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-11-01/Microsoft.DataLakeStore.json#/resourceDefinitions/accounts_firewallRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-11-01/Microsoft.DataLakeStore.json#/resourceDefinitions/accounts_trustedIdProviders',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-11-01/Microsoft.DataLakeStore.json#/resourceDefinitions/accounts_virtualNetworkRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-10-01-preview/Microsoft.DataLakeAnalytics.json#/resourceDefinitions/accounts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-11-01/Microsoft.DataLakeAnalytics.json#/resourceDefinitions/accounts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-11-01/Microsoft.DataLakeAnalytics.json#/resourceDefinitions/accounts_dataLakeStoreAccounts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-11-01/Microsoft.DataLakeAnalytics.json#/resourceDefinitions/accounts_storageAccounts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-11-01/Microsoft.DataLakeAnalytics.json#/resourceDefinitions/accounts_firewallRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-11-01/Microsoft.DataLakeAnalytics.json#/resourceDefinitions/accounts_computePolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-02-01-preview/Microsoft.CognitiveServices.json#/resourceDefinitions/accounts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-04-18/Microsoft.CognitiveServices.json#/resourceDefinitions/accounts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-04-18/Microsoft.CognitiveServices.json#/resourceDefinitions/accounts_privateEndpointConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-01-29/Microsoft.PowerBI.json#/resourceDefinitions/workspaceCollections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-10-01/Microsoft.PowerBIDedicated.json#/resourceDefinitions/capacities',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-03-30/Microsoft.DataCatalog.json#/resourceDefinitions/catalogs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-03-30/Microsoft.ContainerService.json#/resourceDefinitions/containerServices',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-05-04-preview/Microsoft.Network.json#/resourceDefinitions/dnszones',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-05-04-preview/Microsoft.Network.json#/resourceDefinitions/dnszones_A',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-05-04-preview/Microsoft.Network.json#/resourceDefinitions/dnszones_AAAA',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-05-04-preview/Microsoft.Network.json#/resourceDefinitions/dnszones_CNAME',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-05-04-preview/Microsoft.Network.json#/resourceDefinitions/dnszones_MX',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-05-04-preview/Microsoft.Network.json#/resourceDefinitions/dnszones_NS',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-05-04-preview/Microsoft.Network.json#/resourceDefinitions/dnszones_PTR',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-05-04-preview/Microsoft.Network.json#/resourceDefinitions/dnszones_SOA',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-05-04-preview/Microsoft.Network.json#/resourceDefinitions/dnszones_SRV',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-05-04-preview/Microsoft.Network.json#/resourceDefinitions/dnszones_TXT',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-04-01/Microsoft.Network.json#/resourceDefinitions/dnszones',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-04-01/Microsoft.Network.json#/resourceDefinitions/dnszones_A',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-04-01/Microsoft.Network.json#/resourceDefinitions/dnszones_AAAA',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-04-01/Microsoft.Network.json#/resourceDefinitions/dnszones_CNAME',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-04-01/Microsoft.Network.json#/resourceDefinitions/dnszones_MX',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-04-01/Microsoft.Network.json#/resourceDefinitions/dnszones_NS',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-04-01/Microsoft.Network.json#/resourceDefinitions/dnszones_PTR',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-04-01/Microsoft.Network.json#/resourceDefinitions/dnszones_SOA',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-04-01/Microsoft.Network.json#/resourceDefinitions/dnszones_SRV',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-04-01/Microsoft.Network.json#/resourceDefinitions/dnszones_TXT',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-06-01/Microsoft.Cdn.json#/resourceDefinitions/profiles',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-06-01/Microsoft.Cdn.json#/resourceDefinitions/profiles_endpoints',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-06-01/Microsoft.Cdn.json#/resourceDefinitions/profiles_endpoints_customDomains',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-06-01/Microsoft.Cdn.json#/resourceDefinitions/profiles_endpoints_origins',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-04-02/Microsoft.Cdn.json#/resourceDefinitions/profiles',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-04-02/Microsoft.Cdn.json#/resourceDefinitions/profiles_endpoints',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-04-02/Microsoft.Cdn.json#/resourceDefinitions/profiles_endpoints_customDomains',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-04-02/Microsoft.Cdn.json#/resourceDefinitions/profiles_endpoints_origins',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-12-01/Microsoft.Batch.json#/resourceDefinitions/batchAccounts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-12-01/Microsoft.Batch.json#/resourceDefinitions/batchAccounts_applications',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-12-01/Microsoft.Batch.json#/resourceDefinitions/batchAccounts_applications_versions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-09-01/Microsoft.Batch.json#/resourceDefinitions/batchAccounts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-09-01/Microsoft.Batch.json#/resourceDefinitions/batchAccounts_applications',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-09-01/Microsoft.Batch.json#/resourceDefinitions/batchAccounts_applications_versions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-09-01/Microsoft.Batch.json#/resourceDefinitions/batchAccounts_certificates',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-09-01/Microsoft.Batch.json#/resourceDefinitions/batchAccounts_pools',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-04-01/Microsoft.Cache.json#/resourceDefinitions/Redis',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-04-01/Microsoft.Cache.json#/resourceDefinitions/Redis_firewallRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-04-01/Microsoft.Cache.json#/resourceDefinitions/Redis_patchSchedules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-02-01-preview/Microsoft.Logic.json#/resourceDefinitions/workflows',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-06-01/Microsoft.Logic.json#/resourceDefinitions/workflows',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-06-01/Microsoft.Logic.json#/resourceDefinitions/integrationAccounts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-06-01/Microsoft.Logic.json#/resourceDefinitions/integrationAccounts_agreements',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-06-01/Microsoft.Logic.json#/resourceDefinitions/integrationAccounts_certificates',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-06-01/Microsoft.Logic.json#/resourceDefinitions/integrationAccounts_maps',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-06-01/Microsoft.Logic.json#/resourceDefinitions/integrationAccounts_partners',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-06-01/Microsoft.Logic.json#/resourceDefinitions/integrationAccounts_schemas',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-06-01/Microsoft.Logic.json#/resourceDefinitions/integrationAccounts_assemblies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-06-01/Microsoft.Logic.json#/resourceDefinitions/integrationAccounts_batchConfigurations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-10-01/Microsoft.Logic.json#/resourceDefinitions/workflows',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-07-01/Microsoft.Logic.json#/resourceDefinitions/workflows',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-03-01/Microsoft.Scheduler.json#/resourceDefinitions/jobCollections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-03-01/Microsoft.Scheduler.json#/resourceDefinitions/jobCollections_jobs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-05-01-preview/Microsoft.MachineLearning.json#/resourceDefinitions/webServices',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-05-01-preview/Microsoft.MachineLearning.json#/resourceDefinitions/commitmentPlans',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-04-01/Microsoft.MachineLearning.json#/resourceDefinitions/workspaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-19/Microsoft.MachineLearningServices.json#/resourceDefinitions/workspaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-19/Microsoft.MachineLearningServices.json#/resourceDefinitions/workspaces_computes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-05-01-preview/Microsoft.MachineLearningExperimentation.json#/resourceDefinitions/accounts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-05-01-preview/Microsoft.MachineLearningExperimentation.json#/resourceDefinitions/accounts_workspaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-05-01-preview/Microsoft.MachineLearningExperimentation.json#/resourceDefinitions/accounts_workspaces_projects',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-03-01-preview/Microsoft.MachineLearningServices.json#/resourceDefinitions/workspaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-10-31/Microsoft.Automation.json#/resourceDefinitions/automationAccounts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-10-31/Microsoft.Automation.json#/resourceDefinitions/automationAccounts_runbooks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-10-31/Microsoft.Automation.json#/resourceDefinitions/automationAccounts_modules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-10-31/Microsoft.Automation.json#/resourceDefinitions/automationAccounts_certificates',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-10-31/Microsoft.Automation.json#/resourceDefinitions/automationAccounts_connections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-10-31/Microsoft.Automation.json#/resourceDefinitions/automationAccounts_variables',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-10-31/Microsoft.Automation.json#/resourceDefinitions/automationAccounts_schedules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-10-31/Microsoft.Automation.json#/resourceDefinitions/automationAccounts_jobs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-10-31/Microsoft.Automation.json#/resourceDefinitions/automationAccounts_connectionTypes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-10-31/Microsoft.Automation.json#/resourceDefinitions/automationAccounts_compilationjobs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-10-31/Microsoft.Automation.json#/resourceDefinitions/automationAccounts_configurations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-10-31/Microsoft.Automation.json#/resourceDefinitions/automationAccounts_jobSchedules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-10-31/Microsoft.Automation.json#/resourceDefinitions/automationAccounts_nodeConfigurations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-10-31/Microsoft.Automation.json#/resourceDefinitions/automationAccounts_webhooks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-10-31/Microsoft.Automation.json#/resourceDefinitions/automationAccounts_credentials',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-10-31/Microsoft.Automation.json#/resourceDefinitions/automationAccounts_watchers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-05-15-preview/Microsoft.Automation.json#/resourceDefinitions/automationAccounts_softwareUpdateConfigurations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-05-15-preview/Microsoft.Automation.json#/resourceDefinitions/automationAccounts_jobs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-05-15-preview/Microsoft.Automation.json#/resourceDefinitions/automationAccounts_sourceControls',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-05-15-preview/Microsoft.Automation.json#/resourceDefinitions/automationAccounts_sourceControls_sourceControlSyncJobs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-15/Microsoft.Automation.json#/resourceDefinitions/automationAccounts_compilationjobs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-15/Microsoft.Automation.json#/resourceDefinitions/automationAccounts_nodeConfigurations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-30/Microsoft.Automation.json#/resourceDefinitions/automationAccounts_python2Packages',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-30/Microsoft.Automation.json#/resourceDefinitions/automationAccounts_runbooks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-10-01/Microsoft.Media.json#/resourceDefinitions/mediaservices',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-07-01/Microsoft.Media.json#/resourceDefinitions/mediaservices',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-07-01/Microsoft.Media.json#/resourceDefinitions/mediaServices_accountFilters',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-07-01/Microsoft.Media.json#/resourceDefinitions/mediaServices_assets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-07-01/Microsoft.Media.json#/resourceDefinitions/mediaServices_assets_assetFilters',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-07-01/Microsoft.Media.json#/resourceDefinitions/mediaServices_contentKeyPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-07-01/Microsoft.Media.json#/resourceDefinitions/mediaServices_streamingLocators',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-07-01/Microsoft.Media.json#/resourceDefinitions/mediaServices_streamingPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-07-01/Microsoft.Media.json#/resourceDefinitions/mediaServices_transforms',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-07-01/Microsoft.Media.json#/resourceDefinitions/mediaServices_transforms_jobs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-02-03/Microsoft.Devices.json#/resourceDefinitions/IotHubs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-07-01/Microsoft.Devices.json#/resourceDefinitions/IotHubs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-07-01/Microsoft.Devices.json#/resourceDefinitions/IotHubs_certificates',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-22/Microsoft.Devices.json#/resourceDefinitions/IotHubs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-22/Microsoft.Devices.json#/resourceDefinitions/IotHubs_certificates',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-04-01/Microsoft.Devices.json#/resourceDefinitions/IotHubs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-04-01/Microsoft.Devices.json#/resourceDefinitions/IotHubs_certificates',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-22/Microsoft.Devices.json#/resourceDefinitions/IotHubs_eventHubEndpoints_ConsumerGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-04-01/Microsoft.Devices.json#/resourceDefinitions/IotHubs_eventHubEndpoints_ConsumerGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-08-21-preview/Microsoft.Devices.Provisioning.json#/resourceDefinitions/provisioningServices',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-11-15/Microsoft.Devices.Provisioning.json#/resourceDefinitions/provisioningServices',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-11-15/Microsoft.Devices.Provisioning.json#/resourceDefinitions/provisioningServices_certificates',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-03-01/Microsoft.ServiceFabric.json#/resourceDefinitions/clusters',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-09-01/Microsoft.ServiceFabric.json#/resourceDefinitions/clusters',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-07-01-preview/Microsoft.ServiceFabric.json#/resourceDefinitions/clusters',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-07-01-preview/Microsoft.ServiceFabric.json#/resourceDefinitions/clusters_applications',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-07-01-preview/Microsoft.ServiceFabric.json#/resourceDefinitions/clusters_applications_services',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-07-01-preview/Microsoft.ServiceFabric.json#/resourceDefinitions/clusters_applicationTypes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-07-01-preview/Microsoft.ServiceFabric.json#/resourceDefinitions/clusters_applicationTypes_versions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.ServiceFabric.json#/resourceDefinitions/clusters',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-03-01-preview/Microsoft.ServiceFabric.json#/resourceDefinitions/clusters',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-03-01-preview/Microsoft.ServiceFabric.json#/resourceDefinitions/clusters_applications',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-03-01-preview/Microsoft.ServiceFabric.json#/resourceDefinitions/clusters_applications_services',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-03-01-preview/Microsoft.ServiceFabric.json#/resourceDefinitions/clusters_applicationTypes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-03-01-preview/Microsoft.ServiceFabric.json#/resourceDefinitions/clusters_applicationTypes_versions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-06-01/Microsoft.StorSimple.8000.json#/resourceDefinitions/managers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-06-01/Microsoft.StorSimple.8000.json#/resourceDefinitions/managers_accessControlRecords',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-06-01/Microsoft.StorSimple.8000.json#/resourceDefinitions/managers_bandwidthSettings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-06-01/Microsoft.StorSimple.8000.json#/resourceDefinitions/managers_devices_alertSettings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-06-01/Microsoft.StorSimple.8000.json#/resourceDefinitions/managers_devices_backupPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-06-01/Microsoft.StorSimple.8000.json#/resourceDefinitions/managers_devices_backupPolicies_schedules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-06-01/Microsoft.StorSimple.8000.json#/resourceDefinitions/managers_devices_timeSettings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-06-01/Microsoft.StorSimple.8000.json#/resourceDefinitions/managers_devices_volumeContainers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-06-01/Microsoft.StorSimple.8000.json#/resourceDefinitions/managers_devices_volumeContainers_volumes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-06-01/Microsoft.StorSimple.8000.json#/resourceDefinitions/managers_extendedInformation',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-06-01/Microsoft.StorSimple.8000.json#/resourceDefinitions/managers_storageAccountCredentials',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-09-01/Microsoft.Resources.json#/resourceDefinitions/deployments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-05-10/Microsoft.Resources.json#/resourceDefinitions/deployments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-09-01-preview/Microsoft.Solutions.resourcesolutions.json#/resourceDefinitions/applianceDefinitions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-09-01-preview/Microsoft.Solutions.resourcesolutions.json#/resourceDefinitions/appliances',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-07-07/Microsoft.ApiManagement.json#/resourceDefinitions/service',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-07-07/Microsoft.ApiManagement.json#/resourceDefinitions/service_apis',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-07-07/Microsoft.ApiManagement.json#/resourceDefinitions/service_subscriptions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-07-07/Microsoft.ApiManagement.json#/resourceDefinitions/service_products',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-07-07/Microsoft.ApiManagement.json#/resourceDefinitions/service_groups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-07-07/Microsoft.ApiManagement.json#/resourceDefinitions/service_certificates',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-07-07/Microsoft.ApiManagement.json#/resourceDefinitions/service_users',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-07-07/Microsoft.ApiManagement.json#/resourceDefinitions/service_authorizationServers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-07-07/Microsoft.ApiManagement.json#/resourceDefinitions/service_loggers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-07-07/Microsoft.ApiManagement.json#/resourceDefinitions/service_properties',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-07-07/Microsoft.ApiManagement.json#/resourceDefinitions/service_openidConnectProviders',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-07-07/Microsoft.ApiManagement.json#/resourceDefinitions/service_backends',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-07-07/Microsoft.ApiManagement.json#/resourceDefinitions/service_identityProviders',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-07-07/Microsoft.ApiManagement.json#/resourceDefinitions/service_apis_operations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-07-07/Microsoft.ApiManagement.json#/resourceDefinitions/service_groups_users',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-07-07/Microsoft.ApiManagement.json#/resourceDefinitions/service_products_apis',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-07-07/Microsoft.ApiManagement.json#/resourceDefinitions/service_products_groups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01/Microsoft.ApiManagement.json#/resourceDefinitions/service',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_apis',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_apis_operations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_apis_operations_policies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_apis_operations_tags',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_apis_policies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_apis_releases',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_apis_schemas',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_apis_tagDescriptions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_apis_tags',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_authorizationServers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_backends',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_certificates',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_diagnostics',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_diagnostics_loggers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_groups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_groups_users',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_identityProviders',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_loggers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_notifications',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_notifications_recipientEmails',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_notifications_recipientUsers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_openidConnectProviders',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_policies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_products',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_products_apis',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_products_groups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_products_policies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_products_tags',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_properties',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_subscriptions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_tags',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_templates',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_users',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_apis_diagnostics',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_apis_issues',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_api-version-sets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_apis_diagnostics_loggers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_apis_issues_attachments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_apis_issues_comments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_apis',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_apis_operations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_apis_operations_policies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_apis_operations_tags',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_apis_policies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_apis_releases',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_apis_schemas',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_apis_tagDescriptions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_apis_tags',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_authorizationServers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_backends',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_certificates',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_diagnostics',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_diagnostics_loggers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_groups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_groups_users',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_identityProviders',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_loggers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_notifications',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_notifications_recipientEmails',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_notifications_recipientUsers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_openidConnectProviders',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_policies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_products',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_products_apis',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_products_groups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_products_policies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_products_tags',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_properties',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_subscriptions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_tags',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_templates',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_users',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_apis_diagnostics',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_apis_issues',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_api-version-sets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_apis_diagnostics_loggers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_apis_issues_attachments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_apis_issues_comments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01-preview/Microsoft.ApiManagement.json#/resourceDefinitions/service',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01-preview/Microsoft.ApiManagement.json#/resourceDefinitions/service_apis',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01-preview/Microsoft.ApiManagement.json#/resourceDefinitions/service_apis_diagnostics',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01-preview/Microsoft.ApiManagement.json#/resourceDefinitions/service_apis_operations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01-preview/Microsoft.ApiManagement.json#/resourceDefinitions/service_apis_operations_policies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01-preview/Microsoft.ApiManagement.json#/resourceDefinitions/service_apis_operations_tags',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01-preview/Microsoft.ApiManagement.json#/resourceDefinitions/service_apis_policies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01-preview/Microsoft.ApiManagement.json#/resourceDefinitions/service_apis_releases',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01-preview/Microsoft.ApiManagement.json#/resourceDefinitions/service_apis_schemas',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01-preview/Microsoft.ApiManagement.json#/resourceDefinitions/service_apis_tagDescriptions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01-preview/Microsoft.ApiManagement.json#/resourceDefinitions/service_apis_tags',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01-preview/Microsoft.ApiManagement.json#/resourceDefinitions/service_api-version-sets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01-preview/Microsoft.ApiManagement.json#/resourceDefinitions/service_authorizationServers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01-preview/Microsoft.ApiManagement.json#/resourceDefinitions/service_backends',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01-preview/Microsoft.ApiManagement.json#/resourceDefinitions/service_certificates',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01-preview/Microsoft.ApiManagement.json#/resourceDefinitions/service_diagnostics',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01-preview/Microsoft.ApiManagement.json#/resourceDefinitions/service_groups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01-preview/Microsoft.ApiManagement.json#/resourceDefinitions/service_groups_users',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01-preview/Microsoft.ApiManagement.json#/resourceDefinitions/service_identityProviders',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01-preview/Microsoft.ApiManagement.json#/resourceDefinitions/service_loggers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01-preview/Microsoft.ApiManagement.json#/resourceDefinitions/service_notifications',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01-preview/Microsoft.ApiManagement.json#/resourceDefinitions/service_notifications_recipientEmails',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01-preview/Microsoft.ApiManagement.json#/resourceDefinitions/service_notifications_recipientUsers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01-preview/Microsoft.ApiManagement.json#/resourceDefinitions/service_openidConnectProviders',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01-preview/Microsoft.ApiManagement.json#/resourceDefinitions/service_policies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01-preview/Microsoft.ApiManagement.json#/resourceDefinitions/service_products',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01-preview/Microsoft.ApiManagement.json#/resourceDefinitions/service_products_apis',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01-preview/Microsoft.ApiManagement.json#/resourceDefinitions/service_products_groups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01-preview/Microsoft.ApiManagement.json#/resourceDefinitions/service_products_policies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01-preview/Microsoft.ApiManagement.json#/resourceDefinitions/service_products_tags',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01-preview/Microsoft.ApiManagement.json#/resourceDefinitions/service_properties',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01-preview/Microsoft.ApiManagement.json#/resourceDefinitions/service_subscriptions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01-preview/Microsoft.ApiManagement.json#/resourceDefinitions/service_tags',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01-preview/Microsoft.ApiManagement.json#/resourceDefinitions/service_templates',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01-preview/Microsoft.ApiManagement.json#/resourceDefinitions/service_users',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_apis',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_apis_diagnostics',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_apis_operations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_apis_operations_policies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_apis_operations_tags',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_apis_policies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_apis_releases',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_apis_schemas',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_apis_tagDescriptions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_apis_tags',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_apis_issues',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_apiVersionSets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_authorizationServers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_backends',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_caches',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_certificates',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_diagnostics',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_groups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_groups_users',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_identityProviders',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_loggers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_notifications',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_notifications_recipientEmails',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_notifications_recipientUsers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_openidConnectProviders',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_policies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_products',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_products_apis',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_products_groups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_products_policies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_products_tags',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_properties',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_subscriptions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_tags',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_templates',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_users',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_apis_issues_attachments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-01-01/Microsoft.ApiManagement.json#/resourceDefinitions/service_apis_issues_comments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2014-09-01/Microsoft.NotificationHubs.json#/resourceDefinitions/namespaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2014-09-01/Microsoft.NotificationHubs.json#/resourceDefinitions/namespaces_AuthorizationRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2014-09-01/Microsoft.NotificationHubs.json#/resourceDefinitions/namespaces_notificationHubs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2014-09-01/Microsoft.NotificationHubs.json#/resourceDefinitions/namespaces_notificationHubs_AuthorizationRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-03-01/Microsoft.NotificationHubs.json#/resourceDefinitions/namespaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-03-01/Microsoft.NotificationHubs.json#/resourceDefinitions/namespaces_AuthorizationRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-03-01/Microsoft.NotificationHubs.json#/resourceDefinitions/namespaces_notificationHubs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-03-01/Microsoft.NotificationHubs.json#/resourceDefinitions/namespaces_notificationHubs_AuthorizationRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-04-01/Microsoft.NotificationHubs.json#/resourceDefinitions/namespaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-04-01/Microsoft.NotificationHubs.json#/resourceDefinitions/namespaces_AuthorizationRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-04-30-preview/Microsoft.Compute.json#/resourceDefinitions/disks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-04-30-preview/Microsoft.Compute.json#/resourceDefinitions/snapshots',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-04-30-preview/Microsoft.Compute.json#/resourceDefinitions/images',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-04-30-preview/Microsoft.Compute.json#/resourceDefinitions/availabilitySets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-04-30-preview/Microsoft.Compute.json#/resourceDefinitions/virtualMachines',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-04-30-preview/Microsoft.Compute.json#/resourceDefinitions/virtualMachineScaleSets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-04-30-preview/Microsoft.Compute.Extensions.json#/resourceDefinitions/virtualMachines_extensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-06-27-preview/Microsoft.ContainerRegistry.json#/resourceDefinitions/registries',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01/Microsoft.ContainerRegistry.json#/resourceDefinitions/registries',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-06-01-preview/Microsoft.ContainerRegistry.json#/resourceDefinitions/registries',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-06-01-preview/Microsoft.ContainerRegistry.json#/resourceDefinitions/registries_replications',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-06-01-preview/Microsoft.ContainerRegistry.json#/resourceDefinitions/registries_webhooks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-10-01/Microsoft.ContainerRegistry.json#/resourceDefinitions/registries',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-10-01/Microsoft.ContainerRegistry.json#/resourceDefinitions/registries_replications',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-10-01/Microsoft.ContainerRegistry.json#/resourceDefinitions/registries_webhooks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01-preview/Microsoft.ContainerRegistry.json#/resourceDefinitions/registries_buildTasks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01-preview/Microsoft.ContainerRegistry.json#/resourceDefinitions/registries_buildTasks_steps',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-09-01/Microsoft.ContainerRegistry.json#/resourceDefinitions/registries_tasks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-06-01/Microsoft.Network.json#/resourceDefinitions/publicIPAddresses',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-06-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-06-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-06-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-06-01/Microsoft.Network.json#/resourceDefinitions/networkInterfaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-06-01/Microsoft.Network.json#/resourceDefinitions/routeTables',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-07-01/Microsoft.Network.json#/resourceDefinitions/publicIPAddresses',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-07-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-07-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-07-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-07-01/Microsoft.Network.json#/resourceDefinitions/networkInterfaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-07-01/Microsoft.Network.json#/resourceDefinitions/routeTables',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-08-01/Microsoft.Network.json#/resourceDefinitions/publicIPAddresses',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-08-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-08-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-08-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-08-01/Microsoft.Network.json#/resourceDefinitions/networkInterfaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-08-01/Microsoft.Network.json#/resourceDefinitions/routeTables',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-09-01/Microsoft.Network.json#/resourceDefinitions/publicIPAddresses',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-09-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-09-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-09-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-09-01/Microsoft.Network.json#/resourceDefinitions/networkInterfaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-09-01/Microsoft.Network.json#/resourceDefinitions/routeTables',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-10-01/Microsoft.Network.json#/resourceDefinitions/publicIPAddresses',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-10-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-10-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-10-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-10-01/Microsoft.Network.json#/resourceDefinitions/networkInterfaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-10-01/Microsoft.Network.json#/resourceDefinitions/routeTables',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-11-01/Microsoft.Network.json#/resourceDefinitions/publicIPAddresses',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-11-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-11-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-11-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-11-01/Microsoft.Network.json#/resourceDefinitions/networkInterfaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-11-01/Microsoft.Network.json#/resourceDefinitions/routeTables',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-12-01/Microsoft.Network.json#/resourceDefinitions/publicIPAddresses',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-12-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-12-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-12-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-12-01/Microsoft.Network.json#/resourceDefinitions/networkInterfaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-12-01/Microsoft.Network.json#/resourceDefinitions/routeTables',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01/Microsoft.Network.json#/resourceDefinitions/publicIPAddresses',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01/Microsoft.Network.json#/resourceDefinitions/networkInterfaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01/Microsoft.Network.json#/resourceDefinitions/routeTables',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-06-01/Microsoft.Network.json#/resourceDefinitions/publicIPAddresses',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-06-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-06-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-06-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-06-01/Microsoft.Network.json#/resourceDefinitions/networkInterfaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-06-01/Microsoft.Network.json#/resourceDefinitions/routeTables',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-06-01/Microsoft.Network.json#/resourceDefinitions/applicationGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-06-01/Microsoft.Network.json#/resourceDefinitions/connections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-06-01/Microsoft.Network.json#/resourceDefinitions/localNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-06-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-06-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks_subnets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-06-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks_virtualNetworkPeerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-06-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups_securityRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-06-01/Microsoft.Network.json#/resourceDefinitions/routeTables_routes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-30/Microsoft.Compute.json#/resourceDefinitions/disks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-30/Microsoft.Compute.json#/resourceDefinitions/snapshots',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-30/Microsoft.Compute.json#/resourceDefinitions/images',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-30/Microsoft.Compute.json#/resourceDefinitions/availabilitySets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-30/Microsoft.Compute.json#/resourceDefinitions/virtualMachines',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-30/Microsoft.Compute.json#/resourceDefinitions/virtualMachineScaleSets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-30/Microsoft.Compute.Extensions.json#/resourceDefinitions/virtualMachines_extensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2014-04-01/Microsoft.Sql.json#/resourceDefinitions/servers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2014-04-01/Microsoft.Sql.json#/resourceDefinitions/servers_advisors',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2014-04-01/Microsoft.Sql.json#/resourceDefinitions/servers_administrators',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2014-04-01/Microsoft.Sql.json#/resourceDefinitions/servers_auditingPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2014-04-01/Microsoft.Sql.json#/resourceDefinitions/servers_communicationLinks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2014-04-01/Microsoft.Sql.json#/resourceDefinitions/servers_connectionPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2014-04-01/Microsoft.Sql.json#/resourceDefinitions/servers_databases',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2014-04-01/Microsoft.Sql.json#/resourceDefinitions/servers_databases_advisors',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2014-04-01/Microsoft.Sql.json#/resourceDefinitions/servers_databases_auditingPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2014-04-01/Microsoft.Sql.json#/resourceDefinitions/servers_databases_connectionPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2014-04-01/Microsoft.Sql.json#/resourceDefinitions/servers_databases_dataMaskingPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2014-04-01/Microsoft.Sql.json#/resourceDefinitions/servers_databases_dataMaskingPolicies_rules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2014-04-01/Microsoft.Sql.json#/resourceDefinitions/servers_databases_extensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2014-04-01/Microsoft.Sql.json#/resourceDefinitions/servers_databases_geoBackupPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2014-04-01/Microsoft.Sql.json#/resourceDefinitions/servers_databases_securityAlertPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2014-04-01/Microsoft.Sql.json#/resourceDefinitions/servers_databases_transparentDataEncryption',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2014-04-01/Microsoft.Sql.json#/resourceDefinitions/servers_disasterRecoveryConfiguration',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2014-04-01/Microsoft.Sql.json#/resourceDefinitions/servers_elasticPools',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2014-04-01/Microsoft.Sql.json#/resourceDefinitions/servers_firewallRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-05-01-preview/Microsoft.Sql.json#/resourceDefinitions/managedInstances',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-05-01-preview/Microsoft.Sql.json#/resourceDefinitions/servers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-05-01-preview/Microsoft.Sql.json#/resourceDefinitions/servers_databases_auditingSettings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-05-01-preview/Microsoft.Sql.json#/resourceDefinitions/servers_databases_syncGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-05-01-preview/Microsoft.Sql.json#/resourceDefinitions/servers_databases_syncGroups_syncMembers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-05-01-preview/Microsoft.Sql.json#/resourceDefinitions/servers_encryptionProtector',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-05-01-preview/Microsoft.Sql.json#/resourceDefinitions/servers_failoverGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-05-01-preview/Microsoft.Sql.json#/resourceDefinitions/servers_firewallRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-05-01-preview/Microsoft.Sql.json#/resourceDefinitions/servers_keys',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-05-01-preview/Microsoft.Sql.json#/resourceDefinitions/servers_syncAgents',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-05-01-preview/Microsoft.Sql.json#/resourceDefinitions/servers_virtualNetworkRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01-preview/Microsoft.Sql.json#/resourceDefinitions/managedInstances_databases',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01-preview/Microsoft.Sql.json#/resourceDefinitions/servers_auditingSettings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01-preview/Microsoft.Sql.json#/resourceDefinitions/servers_databases',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01-preview/Microsoft.Sql.json#/resourceDefinitions/servers_databases_auditingSettings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01-preview/Microsoft.Sql.json#/resourceDefinitions/servers_databases_backupLongTermRetentionPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01-preview/Microsoft.Sql.json#/resourceDefinitions/servers_databases_extendedAuditingSettings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01-preview/Microsoft.Sql.json#/resourceDefinitions/servers_databases_securityAlertPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01-preview/Microsoft.Sql.json#/resourceDefinitions/servers_securityAlertPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01-preview/Microsoft.Sql.json#/resourceDefinitions/managedInstances_databases_securityAlertPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01-preview/Microsoft.Sql.json#/resourceDefinitions/managedInstances_securityAlertPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01-preview/Microsoft.Sql.json#/resourceDefinitions/servers_databases_vulnerabilityAssessments_rules_baselines',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01-preview/Microsoft.Sql.json#/resourceDefinitions/servers_databases_vulnerabilityAssessments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-10-01-preview/Microsoft.Sql.json#/resourceDefinitions/managedInstances_databases_vulnerabilityAssessments_rules_baselines',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-10-01-preview/Microsoft.Sql.json#/resourceDefinitions/managedInstances_databases_vulnerabilityAssessments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01-preview/Microsoft.Sql.json#/resourceDefinitions/servers_vulnerabilityAssessments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01-preview/Microsoft.Sql.json#/resourceDefinitions/managedInstances_vulnerabilityAssessments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01-preview/Microsoft.Sql.json#/resourceDefinitions/servers_dnsAliases',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01-preview/Microsoft.Sql.json#/resourceDefinitions/servers_extendedAuditingSettings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01-preview/Microsoft.Sql.json#/resourceDefinitions/servers_jobAgents',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01-preview/Microsoft.Sql.json#/resourceDefinitions/servers_jobAgents_credentials',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01-preview/Microsoft.Sql.json#/resourceDefinitions/servers_jobAgents_jobs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01-preview/Microsoft.Sql.json#/resourceDefinitions/servers_jobAgents_jobs_executions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01-preview/Microsoft.Sql.json#/resourceDefinitions/servers_jobAgents_jobs_steps',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01-preview/Microsoft.Sql.json#/resourceDefinitions/servers_jobAgents_targetGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-01-01/Microsoft.MachineLearning.json#/resourceDefinitions/webServices',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-10-01/Microsoft.MachineLearning.json#/resourceDefinitions/workspaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-03-01/Microsoft.StreamAnalytics.json#/resourceDefinitions/streamingjobs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-03-01/Microsoft.StreamAnalytics.json#/resourceDefinitions/streamingjobs_functions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-03-01/Microsoft.StreamAnalytics.json#/resourceDefinitions/streamingjobs_inputs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-03-01/Microsoft.StreamAnalytics.json#/resourceDefinitions/streamingjobs_outputs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-03-01/Microsoft.StreamAnalytics.json#/resourceDefinitions/streamingjobs_transformations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-11-15/Microsoft.TimeSeriesInsights.json#/resourceDefinitions/environments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-11-15/Microsoft.TimeSeriesInsights.json#/resourceDefinitions/environments_eventSources',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-11-15/Microsoft.TimeSeriesInsights.json#/resourceDefinitions/environments_referenceDataSets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-11-15/Microsoft.TimeSeriesInsights.json#/resourceDefinitions/environments_accessPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-08-15-preview/Microsoft.TimeSeriesInsights.json#/resourceDefinitions/environments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-08-15-preview/Microsoft.TimeSeriesInsights.json#/resourceDefinitions/environments_eventSources',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-08-15-preview/Microsoft.TimeSeriesInsights.json#/resourceDefinitions/environments_referenceDataSets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-08-15-preview/Microsoft.TimeSeriesInsights.json#/resourceDefinitions/environments_accessPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-03-01-preview/Microsoft.MachineLearningServices.json#/resourceDefinitions/workspaces_computes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-05-01/Microsoft.MachineLearningServices.json#/resourceDefinitions/workspaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-05-01/Microsoft.MachineLearningServices.json#/resourceDefinitions/workspaces_computes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.MachineLearningServices.json#/resourceDefinitions/workspaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.MachineLearningServices.json#/resourceDefinitions/workspaces_computes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.MachineLearningServices.json#/resourceDefinitions/workspaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.MachineLearningServices.json#/resourceDefinitions/workspaces_computes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-01-01/Microsoft.MachineLearningServices.json#/resourceDefinitions/workspaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-01-01/Microsoft.MachineLearningServices.json#/resourceDefinitions/workspaces_computes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-01-01/Microsoft.MachineLearningServices.json#/resourceDefinitions/workspaces_privateEndpointConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-08-01/Microsoft.Network.json#/resourceDefinitions/publicIPAddresses',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-08-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-08-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-08-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-08-01/Microsoft.Network.json#/resourceDefinitions/networkInterfaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-08-01/Microsoft.Network.json#/resourceDefinitions/routeTables',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-08-01/Microsoft.Network.json#/resourceDefinitions/applicationGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-08-01/Microsoft.Network.json#/resourceDefinitions/connections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-08-01/Microsoft.Network.json#/resourceDefinitions/localNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-08-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-08-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks_subnets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-08-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks_virtualNetworkPeerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-08-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers_inboundNatRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-08-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups_securityRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-08-01/Microsoft.Network.json#/resourceDefinitions/routeTables_routes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-09-01/Microsoft.Network.json#/resourceDefinitions/publicIPAddresses',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-09-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-09-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-09-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-09-01/Microsoft.Network.json#/resourceDefinitions/networkInterfaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-09-01/Microsoft.Network.json#/resourceDefinitions/routeTables',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-09-01/Microsoft.Network.json#/resourceDefinitions/applicationGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-09-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers_inboundNatRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-09-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups_securityRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-09-01/Microsoft.Network.json#/resourceDefinitions/routeTables_routes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-10-01/Microsoft.Network.json#/resourceDefinitions/publicIPAddresses',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-10-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-10-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-10-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-10-01/Microsoft.Network.json#/resourceDefinitions/networkInterfaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-10-01/Microsoft.Network.json#/resourceDefinitions/routeTables',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-10-01/Microsoft.Network.json#/resourceDefinitions/applicationGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-10-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers_inboundNatRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-10-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups_securityRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-10-01/Microsoft.Network.json#/resourceDefinitions/routeTables_routes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-11-01/Microsoft.ImportExport.json#/resourceDefinitions/jobs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-09-01/Microsoft.Network.json#/resourceDefinitions/dnsZones',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-09-01/Microsoft.Network.json#/resourceDefinitions/dnsZones_A',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-09-01/Microsoft.Network.json#/resourceDefinitions/dnsZones_AAAA',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-09-01/Microsoft.Network.json#/resourceDefinitions/dnsZones_CAA',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-09-01/Microsoft.Network.json#/resourceDefinitions/dnsZones_CNAME',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-09-01/Microsoft.Network.json#/resourceDefinitions/dnsZones_MX',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-09-01/Microsoft.Network.json#/resourceDefinitions/dnsZones_NS',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-09-01/Microsoft.Network.json#/resourceDefinitions/dnsZones_PTR',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-09-01/Microsoft.Network.json#/resourceDefinitions/dnsZones_SOA',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-09-01/Microsoft.Network.json#/resourceDefinitions/dnsZones_SRV',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-09-01/Microsoft.Network.json#/resourceDefinitions/dnsZones_TXT',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-09-01/Microsoft.Network.json#/resourceDefinitions/connections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-09-01/Microsoft.Network.json#/resourceDefinitions/localNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-09-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-09-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks_subnets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-09-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks_virtualNetworkPeerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-10-01/Microsoft.Network.json#/resourceDefinitions/dnsZones',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-10-01/Microsoft.Network.json#/resourceDefinitions/dnsZones_A',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-10-01/Microsoft.Network.json#/resourceDefinitions/dnsZones_AAAA',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-10-01/Microsoft.Network.json#/resourceDefinitions/dnsZones_CAA',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-10-01/Microsoft.Network.json#/resourceDefinitions/dnsZones_CNAME',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-10-01/Microsoft.Network.json#/resourceDefinitions/dnsZones_MX',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-10-01/Microsoft.Network.json#/resourceDefinitions/dnsZones_NS',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-10-01/Microsoft.Network.json#/resourceDefinitions/dnsZones_PTR',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-10-01/Microsoft.Network.json#/resourceDefinitions/dnsZones_SOA',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-10-01/Microsoft.Network.json#/resourceDefinitions/dnsZones_SRV',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-10-01/Microsoft.Network.json#/resourceDefinitions/dnsZones_TXT',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-10-01/Microsoft.Network.json#/resourceDefinitions/connections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-10-01/Microsoft.Network.json#/resourceDefinitions/localNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-10-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-10-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks_subnets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-10-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks_virtualNetworkPeerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-06-01/Microsoft.AzureStack.json#/resourceDefinitions/registrations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-06-01/Microsoft.AzureStack.json#/resourceDefinitions/registrations_customerSubscriptions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-11-01/Microsoft.Network.json#/resourceDefinitions/publicIPAddresses',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-11-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-11-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-11-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-11-01/Microsoft.Network.json#/resourceDefinitions/networkInterfaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-11-01/Microsoft.Network.json#/resourceDefinitions/routeTables',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-11-01/Microsoft.Network.json#/resourceDefinitions/applicationGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-11-01/Microsoft.Network.json#/resourceDefinitions/connections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-11-01/Microsoft.Network.json#/resourceDefinitions/localNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-11-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-11-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks_subnets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-11-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks_virtualNetworkPeerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-11-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers_inboundNatRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-11-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups_securityRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-11-01/Microsoft.Network.json#/resourceDefinitions/routeTables_routes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-12-01/Microsoft.Compute.json#/resourceDefinitions/images',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-12-01/Microsoft.Compute.json#/resourceDefinitions/availabilitySets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-12-01/Microsoft.Compute.json#/resourceDefinitions/virtualMachines',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-12-01/Microsoft.Compute.json#/resourceDefinitions/virtualMachineScaleSets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-12-01/Microsoft.Compute.Extensions.json#/resourceDefinitions/virtualMachines_extensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-12-01/Microsoft.Compute.Extensions.json#/resourceDefinitions/virtualMachineScaleSets_extensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.DBforMariaDB.json#/resourceDefinitions/servers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.DBforMariaDB.json#/resourceDefinitions/servers_configurations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.DBforMariaDB.json#/resourceDefinitions/servers_databases',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.DBforMariaDB.json#/resourceDefinitions/servers_firewallRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.DBforMariaDB.json#/resourceDefinitions/servers_virtualNetworkRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.DBforMariaDB.json#/resourceDefinitions/servers_securityAlertPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.DBforMariaDB.json#/resourceDefinitions/servers_privateEndpointConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-12-01/Microsoft.DBforMySQL.json#/resourceDefinitions/servers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-12-01/Microsoft.DBforMySQL.json#/resourceDefinitions/servers_configurations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-12-01/Microsoft.DBforMySQL.json#/resourceDefinitions/servers_databases',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-12-01/Microsoft.DBforMySQL.json#/resourceDefinitions/servers_firewallRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-12-01/Microsoft.DBforMySQL.json#/resourceDefinitions/servers_virtualNetworkRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-12-01/Microsoft.DBforMySQL.json#/resourceDefinitions/servers_securityAlertPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-12-01/Microsoft.DBforMySQL.json#/resourceDefinitions/servers_administrators',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-12-01/Microsoft.DBforPostgreSQL.json#/resourceDefinitions/servers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-12-01/Microsoft.DBforPostgreSQL.json#/resourceDefinitions/servers_configurations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-12-01/Microsoft.DBforPostgreSQL.json#/resourceDefinitions/servers_databases',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-12-01/Microsoft.DBforPostgreSQL.json#/resourceDefinitions/servers_firewallRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-12-01/Microsoft.DBforPostgreSQL.json#/resourceDefinitions/servers_virtualNetworkRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-12-01/Microsoft.DBforPostgreSQL.json#/resourceDefinitions/servers_securityAlertPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-12-01/Microsoft.DBforPostgreSQL.json#/resourceDefinitions/servers_administrators',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-12-01-preview/Microsoft.DBforMySQL.json#/resourceDefinitions/servers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-12-01-preview/Microsoft.DBforMySQL.json#/resourceDefinitions/servers_configurations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-12-01-preview/Microsoft.DBforMySQL.json#/resourceDefinitions/servers_databases',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-12-01-preview/Microsoft.DBforMySQL.json#/resourceDefinitions/servers_firewallRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-12-01-preview/Microsoft.DBforPostgreSQL.json#/resourceDefinitions/servers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-12-01-preview/Microsoft.DBforPostgreSQL.json#/resourceDefinitions/servers_configurations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-12-01-preview/Microsoft.DBforPostgreSQL.json#/resourceDefinitions/servers_databases',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-12-01-preview/Microsoft.DBforPostgreSQL.json#/resourceDefinitions/servers_firewallRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-05-01-preview/Microsoft.Network.json#/resourceDefinitions/applicationGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-05-01-preview/Microsoft.Network.json#/resourceDefinitions/connections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-05-01-preview/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_authorizations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-05-01-preview/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_peerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-05-01-preview/Microsoft.Network.json#/resourceDefinitions/loadBalancers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-05-01-preview/Microsoft.Network.json#/resourceDefinitions/localNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-05-01-preview/Microsoft.Network.json#/resourceDefinitions/networkInterfaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-05-01-preview/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-05-01-preview/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups_securityRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-05-01-preview/Microsoft.Network.json#/resourceDefinitions/publicIPAddresses',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-05-01-preview/Microsoft.Network.json#/resourceDefinitions/routeTables',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-05-01-preview/Microsoft.Network.json#/resourceDefinitions/routeTables_routes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-05-01-preview/Microsoft.Network.json#/resourceDefinitions/virtualNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-05-01-preview/Microsoft.Network.json#/resourceDefinitions/virtualNetworks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-05-01-preview/Microsoft.Network.json#/resourceDefinitions/virtualNetworks_subnets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-06-15/Microsoft.Network.json#/resourceDefinitions/applicationGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-06-15/Microsoft.Network.json#/resourceDefinitions/connections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-06-15/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-06-15/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_authorizations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-06-15/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_peerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-06-15/Microsoft.Network.json#/resourceDefinitions/loadBalancers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-06-15/Microsoft.Network.json#/resourceDefinitions/localNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-06-15/Microsoft.Network.json#/resourceDefinitions/networkInterfaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-06-15/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-06-15/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups_securityRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-06-15/Microsoft.Network.json#/resourceDefinitions/publicIPAddresses',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-06-15/Microsoft.Network.json#/resourceDefinitions/routeTables',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-06-15/Microsoft.Network.json#/resourceDefinitions/routeTables_routes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-06-15/Microsoft.Network.json#/resourceDefinitions/virtualNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-06-15/Microsoft.Network.json#/resourceDefinitions/virtualNetworks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-06-15/Microsoft.Network.json#/resourceDefinitions/virtualNetworks_subnets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-03-30/Microsoft.Network.json#/resourceDefinitions/applicationGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-03-30/Microsoft.Network.json#/resourceDefinitions/connections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-03-30/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-03-30/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_authorizations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-03-30/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_peerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-03-30/Microsoft.Network.json#/resourceDefinitions/loadBalancers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-03-30/Microsoft.Network.json#/resourceDefinitions/localNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-03-30/Microsoft.Network.json#/resourceDefinitions/networkInterfaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-03-30/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-03-30/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups_securityRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-03-30/Microsoft.Network.json#/resourceDefinitions/publicIPAddresses',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-03-30/Microsoft.Network.json#/resourceDefinitions/routeTables',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-03-30/Microsoft.Network.json#/resourceDefinitions/routeTables_routes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-03-30/Microsoft.Network.json#/resourceDefinitions/virtualNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-03-30/Microsoft.Network.json#/resourceDefinitions/virtualNetworks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-03-30/Microsoft.Network.json#/resourceDefinitions/virtualNetworks_subnets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-09-01/Microsoft.Network.json#/resourceDefinitions/applicationSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-10-01/Microsoft.Network.json#/resourceDefinitions/applicationSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-11-01/Microsoft.Network.json#/resourceDefinitions/applicationSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.Network.json#/resourceDefinitions/applicationSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.Network.json#/resourceDefinitions/publicIPAddresses',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.Network.json#/resourceDefinitions/networkInterfaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.Network.json#/resourceDefinitions/routeTables',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.Network.json#/resourceDefinitions/applicationGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.Network.json#/resourceDefinitions/connections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.Network.json#/resourceDefinitions/localNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks_subnets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks_virtualNetworkPeerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers_inboundNatRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups_securityRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.Network.json#/resourceDefinitions/routeTables_routes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Network.json#/resourceDefinitions/applicationSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Network.json#/resourceDefinitions/ddosProtectionPlans',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCrossConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Network.json#/resourceDefinitions/publicIPAddresses',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Network.json#/resourceDefinitions/networkInterfaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Network.json#/resourceDefinitions/routeTables',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers_inboundNatRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups_securityRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Network.json#/resourceDefinitions/routeTables_routes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_authorizations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_peerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCrossConnections_peerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_peerings_connections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-04-01/Microsoft.Network.json#/resourceDefinitions/applicationGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-04-01/Microsoft.Network.json#/resourceDefinitions/applicationSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-04-01/Microsoft.Network.json#/resourceDefinitions/azureFirewalls',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-04-01/Microsoft.Network.json#/resourceDefinitions/connections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-04-01/Microsoft.Network.json#/resourceDefinitions/ddosProtectionPlans',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-04-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-04-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_authorizations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-04-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_peerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-04-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_peerings_connections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-04-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCrossConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-04-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCrossConnections_peerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-04-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-04-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers_inboundNatRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-04-01/Microsoft.Network.json#/resourceDefinitions/localNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-04-01/Microsoft.Network.json#/resourceDefinitions/networkInterfaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-04-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-04-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups_securityRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-04-01/Microsoft.Network.json#/resourceDefinitions/networkWatchers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-04-01/Microsoft.Network.json#/resourceDefinitions/networkWatchers_connectionMonitors',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-04-01/Microsoft.Network.json#/resourceDefinitions/networkWatchers_packetCaptures',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-04-01/Microsoft.Network.json#/resourceDefinitions/publicIPAddresses',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-04-01/Microsoft.Network.json#/resourceDefinitions/routeFilters',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-04-01/Microsoft.Network.json#/resourceDefinitions/routeFilters_routeFilterRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-04-01/Microsoft.Network.json#/resourceDefinitions/routeTables',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-04-01/Microsoft.Network.json#/resourceDefinitions/routeTables_routes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-04-01/Microsoft.Network.json#/resourceDefinitions/virtualHubs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-04-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-04-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-04-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks_subnets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-04-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks_virtualNetworkPeerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-04-01/Microsoft.Network.json#/resourceDefinitions/virtualWans',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-04-01/Microsoft.Network.json#/resourceDefinitions/vpnGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-04-01/Microsoft.Network.json#/resourceDefinitions/vpnGateways_vpnConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-04-01/Microsoft.Network.json#/resourceDefinitions/vpnSites',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.Network.json#/resourceDefinitions/applicationGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.Network.json#/resourceDefinitions/applicationSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.Network.json#/resourceDefinitions/azureFirewalls',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.Network.json#/resourceDefinitions/connections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.Network.json#/resourceDefinitions/ddosProtectionPlans',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_authorizations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_peerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_peerings_connections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCrossConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCrossConnections_peerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers_inboundNatRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.Network.json#/resourceDefinitions/localNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.Network.json#/resourceDefinitions/networkInterfaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups_securityRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.Network.json#/resourceDefinitions/networkWatchers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.Network.json#/resourceDefinitions/networkWatchers_connectionMonitors',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.Network.json#/resourceDefinitions/networkWatchers_packetCaptures',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.Network.json#/resourceDefinitions/publicIPAddresses',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.Network.json#/resourceDefinitions/routeFilters',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.Network.json#/resourceDefinitions/routeFilters_routeFilterRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.Network.json#/resourceDefinitions/routeTables',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.Network.json#/resourceDefinitions/routeTables_routes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.Network.json#/resourceDefinitions/virtualHubs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks_subnets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks_virtualNetworkPeerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.Network.json#/resourceDefinitions/virtualWans',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.Network.json#/resourceDefinitions/vpnGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.Network.json#/resourceDefinitions/vpnGateways_vpnConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.Network.json#/resourceDefinitions/vpnSites',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-07-01/Microsoft.Network.json#/resourceDefinitions/applicationGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-07-01/Microsoft.Network.json#/resourceDefinitions/applicationSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-07-01/Microsoft.Network.json#/resourceDefinitions/azureFirewalls',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-07-01/Microsoft.Network.json#/resourceDefinitions/connections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-07-01/Microsoft.Network.json#/resourceDefinitions/ddosProtectionPlans',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-07-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-07-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_authorizations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-07-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_peerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-07-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_peerings_connections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-07-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCrossConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-07-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCrossConnections_peerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-07-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-07-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers_inboundNatRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-07-01/Microsoft.Network.json#/resourceDefinitions/localNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-07-01/Microsoft.Network.json#/resourceDefinitions/networkInterfaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-07-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-07-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups_securityRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-07-01/Microsoft.Network.json#/resourceDefinitions/networkWatchers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-07-01/Microsoft.Network.json#/resourceDefinitions/networkWatchers_connectionMonitors',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-07-01/Microsoft.Network.json#/resourceDefinitions/networkWatchers_packetCaptures',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-07-01/Microsoft.Network.json#/resourceDefinitions/publicIPAddresses',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-07-01/Microsoft.Network.json#/resourceDefinitions/publicIPPrefixes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-07-01/Microsoft.Network.json#/resourceDefinitions/routeFilters',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-07-01/Microsoft.Network.json#/resourceDefinitions/routeFilters_routeFilterRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-07-01/Microsoft.Network.json#/resourceDefinitions/routeTables',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-07-01/Microsoft.Network.json#/resourceDefinitions/routeTables_routes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-07-01/Microsoft.Network.json#/resourceDefinitions/serviceEndpointPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-07-01/Microsoft.Network.json#/resourceDefinitions/serviceEndpointPolicies_serviceEndpointPolicyDefinitions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-07-01/Microsoft.Network.json#/resourceDefinitions/virtualHubs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-07-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-07-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-07-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks_subnets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-07-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks_virtualNetworkPeerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-07-01/Microsoft.Network.json#/resourceDefinitions/virtualWans',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-07-01/Microsoft.Network.json#/resourceDefinitions/vpnGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-07-01/Microsoft.Network.json#/resourceDefinitions/vpnGateways_vpnConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-07-01/Microsoft.Network.json#/resourceDefinitions/vpnSites',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-08-01/Microsoft.Network.json#/resourceDefinitions/applicationSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-08-01/Microsoft.Network.json#/resourceDefinitions/ddosProtectionPlans',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-08-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-08-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCrossConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-08-01/Microsoft.Network.json#/resourceDefinitions/publicIPAddresses',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-08-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-08-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-08-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-08-01/Microsoft.Network.json#/resourceDefinitions/networkInterfaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-08-01/Microsoft.Network.json#/resourceDefinitions/routeTables',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-08-01/Microsoft.Network.json#/resourceDefinitions/applicationGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-08-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_authorizations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-08-01/Microsoft.Network.json#/resourceDefinitions/ExpressRoutePorts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-08-01/Microsoft.Network.json#/resourceDefinitions/connections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-08-01/Microsoft.Network.json#/resourceDefinitions/localNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-08-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-08-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks_subnets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-08-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks_virtualNetworkPeerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-08-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_peerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-08-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCrossConnections_peerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-08-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers_inboundNatRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-08-01/Microsoft.Network.json#/resourceDefinitions/networkInterfaces_tapConfigurations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-08-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups_securityRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-08-01/Microsoft.Network.json#/resourceDefinitions/routeTables_routes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-08-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_peerings_connections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-10-01/Microsoft.Network.json#/resourceDefinitions/applicationSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-10-01/Microsoft.Network.json#/resourceDefinitions/ddosProtectionPlans',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-10-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-10-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCrossConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-10-01/Microsoft.Network.json#/resourceDefinitions/publicIPAddresses',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-10-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-10-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-10-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-10-01/Microsoft.Network.json#/resourceDefinitions/networkInterfaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-10-01/Microsoft.Network.json#/resourceDefinitions/routeTables',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-10-01/Microsoft.Network.json#/resourceDefinitions/applicationGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-10-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_authorizations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-10-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_peerings_connections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Network.json#/resourceDefinitions/applicationSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-12-01/Microsoft.Network.json#/resourceDefinitions/applicationSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-12-01/Microsoft.Network.json#/resourceDefinitions/ddosProtectionPlans',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-12-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-12-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCrossConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-12-01/Microsoft.Network.json#/resourceDefinitions/publicIPAddresses',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-12-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-12-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-12-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-12-01/Microsoft.Network.json#/resourceDefinitions/networkInterfaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-12-01/Microsoft.Network.json#/resourceDefinitions/routeTables',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-12-01/Microsoft.Network.json#/resourceDefinitions/applicationGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-12-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_authorizations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-12-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_peerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-12-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCrossConnections_peerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-12-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers_inboundNatRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-12-01/Microsoft.Network.json#/resourceDefinitions/networkInterfaces_tapConfigurations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-12-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups_securityRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-12-01/Microsoft.Network.json#/resourceDefinitions/routeTables_routes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-12-01/Microsoft.Network.json#/resourceDefinitions/ExpressRoutePorts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-12-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_peerings_connections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-02-01/Microsoft.Network.json#/resourceDefinitions/applicationSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-02-01/Microsoft.Network.json#/resourceDefinitions/ddosProtectionPlans',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-02-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-02-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCrossConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-02-01/Microsoft.Network.json#/resourceDefinitions/publicIPAddresses',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-02-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-02-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-02-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-02-01/Microsoft.Network.json#/resourceDefinitions/networkInterfaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-02-01/Microsoft.Network.json#/resourceDefinitions/routeTables',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-02-01/Microsoft.Network.json#/resourceDefinitions/applicationGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-02-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_authorizations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-02-01/Microsoft.Network.json#/resourceDefinitions/ExpressRoutePorts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-02-01/Microsoft.Network.json#/resourceDefinitions/ApplicationGatewayWebApplicationFirewallPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-02-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_peerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-02-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCrossConnections_peerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-02-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers_inboundNatRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-02-01/Microsoft.Network.json#/resourceDefinitions/networkInterfaces_tapConfigurations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-02-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups_securityRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-02-01/Microsoft.Network.json#/resourceDefinitions/routeTables_routes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-02-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_peerings_connections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Network.json#/resourceDefinitions/applicationGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Network.json#/resourceDefinitions/ApplicationGatewayWebApplicationFirewallPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Network.json#/resourceDefinitions/applicationSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Network.json#/resourceDefinitions/azureFirewalls',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Network.json#/resourceDefinitions/bastionHosts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Network.json#/resourceDefinitions/connections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Network.json#/resourceDefinitions/ddosCustomPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Network.json#/resourceDefinitions/ddosProtectionPlans',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_authorizations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_peerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_peerings_connections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCrossConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCrossConnections_peerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Network.json#/resourceDefinitions/expressRouteGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Network.json#/resourceDefinitions/expressRouteGateways_expressRouteConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Network.json#/resourceDefinitions/ExpressRoutePorts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers_inboundNatRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Network.json#/resourceDefinitions/localNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Network.json#/resourceDefinitions/natGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Network.json#/resourceDefinitions/networkInterfaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Network.json#/resourceDefinitions/networkInterfaces_tapConfigurations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Network.json#/resourceDefinitions/networkProfiles',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups_securityRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Network.json#/resourceDefinitions/networkWatchers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Network.json#/resourceDefinitions/networkWatchers_connectionMonitors',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Network.json#/resourceDefinitions/networkWatchers_packetCaptures',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Network.json#/resourceDefinitions/p2svpnGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Network.json#/resourceDefinitions/privateEndpoints',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Network.json#/resourceDefinitions/privateLinkServices',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Network.json#/resourceDefinitions/privateLinkServices_privateEndpointConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Network.json#/resourceDefinitions/publicIPAddresses',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Network.json#/resourceDefinitions/publicIPPrefixes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Network.json#/resourceDefinitions/routeFilters',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Network.json#/resourceDefinitions/routeFilters_routeFilterRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Network.json#/resourceDefinitions/routeTables',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Network.json#/resourceDefinitions/routeTables_routes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Network.json#/resourceDefinitions/serviceEndpointPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Network.json#/resourceDefinitions/serviceEndpointPolicies_serviceEndpointPolicyDefinitions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Network.json#/resourceDefinitions/virtualHubs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks_subnets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks_virtualNetworkPeerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworkTaps',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Network.json#/resourceDefinitions/virtualWans',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Network.json#/resourceDefinitions/virtualWans_p2sVpnServerConfigurations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Network.json#/resourceDefinitions/vpnGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Network.json#/resourceDefinitions/vpnGateways_vpnConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-04-01/Microsoft.Network.json#/resourceDefinitions/vpnSites',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Network.json#/resourceDefinitions/applicationGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Network.json#/resourceDefinitions/ApplicationGatewayWebApplicationFirewallPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Network.json#/resourceDefinitions/applicationSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Network.json#/resourceDefinitions/azureFirewalls',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Network.json#/resourceDefinitions/bastionHosts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Network.json#/resourceDefinitions/connections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Network.json#/resourceDefinitions/ddosCustomPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Network.json#/resourceDefinitions/ddosProtectionPlans',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_authorizations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_peerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_peerings_connections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCrossConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCrossConnections_peerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Network.json#/resourceDefinitions/expressRouteGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Network.json#/resourceDefinitions/expressRouteGateways_expressRouteConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Network.json#/resourceDefinitions/ExpressRoutePorts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Network.json#/resourceDefinitions/firewallPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Network.json#/resourceDefinitions/firewallPolicies_ruleGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers_inboundNatRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Network.json#/resourceDefinitions/localNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Network.json#/resourceDefinitions/natGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Network.json#/resourceDefinitions/networkInterfaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Network.json#/resourceDefinitions/networkInterfaces_tapConfigurations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Network.json#/resourceDefinitions/networkProfiles',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups_securityRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Network.json#/resourceDefinitions/networkWatchers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Network.json#/resourceDefinitions/networkWatchers_connectionMonitors',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Network.json#/resourceDefinitions/networkWatchers_packetCaptures',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Network.json#/resourceDefinitions/p2svpnGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Network.json#/resourceDefinitions/privateEndpoints',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Network.json#/resourceDefinitions/privateLinkServices',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Network.json#/resourceDefinitions/privateLinkServices_privateEndpointConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Network.json#/resourceDefinitions/publicIPAddresses',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Network.json#/resourceDefinitions/publicIPPrefixes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Network.json#/resourceDefinitions/routeFilters',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Network.json#/resourceDefinitions/routeFilters_routeFilterRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Network.json#/resourceDefinitions/routeTables',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Network.json#/resourceDefinitions/routeTables_routes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Network.json#/resourceDefinitions/serviceEndpointPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Network.json#/resourceDefinitions/serviceEndpointPolicies_serviceEndpointPolicyDefinitions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Network.json#/resourceDefinitions/virtualHubs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks_subnets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks_virtualNetworkPeerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworkTaps',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Network.json#/resourceDefinitions/virtualWans',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Network.json#/resourceDefinitions/virtualWans_p2sVpnServerConfigurations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Network.json#/resourceDefinitions/vpnGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Network.json#/resourceDefinitions/vpnGateways_vpnConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Network.json#/resourceDefinitions/vpnSites',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/applicationGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/ApplicationGatewayWebApplicationFirewallPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/applicationSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/azureFirewalls',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/bastionHosts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/connections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/ddosCustomPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/ddosProtectionPlans',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_authorizations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_peerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_peerings_connections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCrossConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCrossConnections_peerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/expressRouteGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/expressRouteGateways_expressRouteConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/ExpressRoutePorts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/firewallPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/firewallPolicies_ruleGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers_inboundNatRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/localNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/natGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/networkInterfaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/networkInterfaces_tapConfigurations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/networkProfiles',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups_securityRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/networkWatchers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/networkWatchers_packetCaptures',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/p2svpnGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/privateEndpoints',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/privateLinkServices',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/privateLinkServices_privateEndpointConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/publicIPAddresses',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/publicIPPrefixes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/routeFilters',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/routeFilters_routeFilterRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/routeTables',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/routeTables_routes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/serviceEndpointPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/serviceEndpointPolicies_serviceEndpointPolicyDefinitions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/virtualHubs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks_subnets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks_virtualNetworkPeerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworkTaps',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/virtualRouters',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/virtualRouters_peerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/virtualWans',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/virtualWans_p2sVpnServerConfigurations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/vpnGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/vpnGateways_vpnConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Network.json#/resourceDefinitions/vpnSites',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/applicationGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/ApplicationGatewayWebApplicationFirewallPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/applicationSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/azureFirewalls',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/bastionHosts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/connections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/ddosCustomPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/ddosProtectionPlans',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_authorizations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_peerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_peerings_connections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCrossConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCrossConnections_peerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/expressRouteGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/expressRouteGateways_expressRouteConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/ExpressRoutePorts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/firewallPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/firewallPolicies_ruleGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers_inboundNatRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/localNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/natGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/networkInterfaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/networkInterfaces_tapConfigurations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/networkProfiles',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups_securityRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/networkWatchers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/networkWatchers_packetCaptures',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/p2svpnGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/privateEndpoints',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/privateLinkServices',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/privateLinkServices_privateEndpointConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/publicIPAddresses',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/publicIPPrefixes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/routeFilters',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/routeFilters_routeFilterRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/routeTables',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/routeTables_routes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/serviceEndpointPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/serviceEndpointPolicies_serviceEndpointPolicyDefinitions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/virtualHubs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks_subnets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks_virtualNetworkPeerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworkTaps',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/virtualRouters',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/virtualRouters_peerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/virtualWans',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/vpnGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/vpnGateways_vpnConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/vpnServerConfigurations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Network.json#/resourceDefinitions/vpnSites',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/applicationGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/ApplicationGatewayWebApplicationFirewallPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/applicationSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/azureFirewalls',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/bastionHosts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/connections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/ddosCustomPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/ddosProtectionPlans',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_authorizations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_peerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_peerings_connections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCrossConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCrossConnections_peerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/expressRouteGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/expressRouteGateways_expressRouteConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/ExpressRoutePorts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/firewallPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/firewallPolicies_ruleGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/ipGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers_inboundNatRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/localNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/natGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/networkInterfaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/networkInterfaces_tapConfigurations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/networkProfiles',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups_securityRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/networkWatchers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/networkWatchers_packetCaptures',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/p2svpnGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/privateEndpoints',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/privateLinkServices',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/privateLinkServices_privateEndpointConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/publicIPAddresses',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/publicIPPrefixes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/routeFilters',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/routeFilters_routeFilterRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/routeTables',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/routeTables_routes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/serviceEndpointPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/serviceEndpointPolicies_serviceEndpointPolicyDefinitions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/virtualHubs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/virtualHubs_routeTables',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks_subnets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks_virtualNetworkPeerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworkTaps',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/virtualRouters',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/virtualRouters_peerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/virtualWans',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/vpnGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/vpnGateways_vpnConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/vpnServerConfigurations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Network.json#/resourceDefinitions/vpnSites',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-02-01/Microsoft.Network.json#/resourceDefinitions/natGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-02-01/Microsoft.Network.json#/resourceDefinitions/connections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-02-01/Microsoft.Network.json#/resourceDefinitions/localNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-02-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-02-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks_subnets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-02-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks_virtualNetworkPeerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-12-01/Microsoft.Network.json#/resourceDefinitions/ApplicationGatewayWebApplicationFirewallPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-12-01/Microsoft.Network.json#/resourceDefinitions/connections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-12-01/Microsoft.Network.json#/resourceDefinitions/localNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-12-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-12-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks_subnets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-12-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks_virtualNetworkPeerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Network.json#/resourceDefinitions/ddosProtectionPlans',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCrossConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Network.json#/resourceDefinitions/publicIPAddresses',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Network.json#/resourceDefinitions/networkInterfaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Network.json#/resourceDefinitions/routeTables',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Network.json#/resourceDefinitions/applicationGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_authorizations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Network.json#/resourceDefinitions/ExpressRoutePorts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Network.json#/resourceDefinitions/connections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Network.json#/resourceDefinitions/localNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks_subnets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks_virtualNetworkPeerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_peerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCrossConnections_peerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers_inboundNatRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Network.json#/resourceDefinitions/networkInterfaces_tapConfigurations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups_securityRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Network.json#/resourceDefinitions/routeTables_routes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_peerings_connections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-10-01/Microsoft.Network.json#/resourceDefinitions/ExpressRoutePorts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-10-01/Microsoft.Network.json#/resourceDefinitions/connections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-10-01/Microsoft.Network.json#/resourceDefinitions/localNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-10-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-10-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks_subnets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-10-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks_virtualNetworkPeerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-10-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_peerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-10-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCrossConnections_peerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-10-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers_inboundNatRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-10-01/Microsoft.Network.json#/resourceDefinitions/networkInterfaces_tapConfigurations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-10-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups_securityRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-10-01/Microsoft.Network.json#/resourceDefinitions/routeTables_routes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Network.json#/resourceDefinitions/applicationGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Network.json#/resourceDefinitions/connections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Network.json#/resourceDefinitions/localNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks_subnets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks_virtualNetworkPeerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-05-01/Microsoft.Network.json#/resourceDefinitions/dnsZones',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-05-01/Microsoft.Network.json#/resourceDefinitions/dnsZones_A',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-05-01/Microsoft.Network.json#/resourceDefinitions/dnsZones_AAAA',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-05-01/Microsoft.Network.json#/resourceDefinitions/dnsZones_CAA',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-05-01/Microsoft.Network.json#/resourceDefinitions/dnsZones_CNAME',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-05-01/Microsoft.Network.json#/resourceDefinitions/dnsZones_MX',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-05-01/Microsoft.Network.json#/resourceDefinitions/dnsZones_NS',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-05-01/Microsoft.Network.json#/resourceDefinitions/dnsZones_PTR',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-05-01/Microsoft.Network.json#/resourceDefinitions/dnsZones_SOA',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-05-01/Microsoft.Network.json#/resourceDefinitions/dnsZones_SRV',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-05-01/Microsoft.Network.json#/resourceDefinitions/dnsZones_TXT',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-09-01/Microsoft.Network.json#/resourceDefinitions/privateDnsZones',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-09-01/Microsoft.Network.json#/resourceDefinitions/privateDnsZones_virtualNetworkLinks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-09-01/Microsoft.Network.json#/resourceDefinitions/privateDnsZones_A',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-09-01/Microsoft.Network.json#/resourceDefinitions/privateDnsZones_AAAA',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-09-01/Microsoft.Network.json#/resourceDefinitions/privateDnsZones_CNAME',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-09-01/Microsoft.Network.json#/resourceDefinitions/privateDnsZones_MX',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-09-01/Microsoft.Network.json#/resourceDefinitions/privateDnsZones_PTR',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-09-01/Microsoft.Network.json#/resourceDefinitions/privateDnsZones_SOA',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-09-01/Microsoft.Network.json#/resourceDefinitions/privateDnsZones_SRV',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-09-01/Microsoft.Network.json#/resourceDefinitions/privateDnsZones_TXT',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/applicationGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/ApplicationGatewayWebApplicationFirewallPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/applicationSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/azureFirewalls',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/bastionHosts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/connections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/ddosCustomPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/ddosProtectionPlans',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_authorizations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_peerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_peerings_connections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCrossConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCrossConnections_peerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/expressRouteGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/expressRouteGateways_expressRouteConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/ExpressRoutePorts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/firewallPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/firewallPolicies_ruleGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/ipGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers_inboundNatRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/localNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/natGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/networkInterfaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/networkInterfaces_tapConfigurations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/networkProfiles',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups_securityRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/networkWatchers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/networkWatchers_packetCaptures',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/p2svpnGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/privateEndpoints',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/privateLinkServices',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/privateLinkServices_privateEndpointConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/publicIPAddresses',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/publicIPPrefixes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/routeFilters',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/routeFilters_routeFilterRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/routeTables',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/routeTables_routes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/serviceEndpointPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/serviceEndpointPolicies_serviceEndpointPolicyDefinitions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/virtualHubs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/virtualHubs_routeTables',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks_subnets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks_virtualNetworkPeerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworkTaps',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/virtualRouters',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/virtualRouters_peerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/virtualWans',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/vpnGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/vpnGateways_vpnConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/vpnServerConfigurations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/vpnSites',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/networkWatchers_connectionMonitors',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01/Microsoft.Network.json#/resourceDefinitions/networkWatchers_flowLogs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/applicationGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/ApplicationGatewayWebApplicationFirewallPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/applicationSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/azureFirewalls',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/bastionHosts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/connections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/connections_sharedkey',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/ddosCustomPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/ddosProtectionPlans',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_authorizations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_peerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_peerings_connections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCrossConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCrossConnections_peerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/expressRouteGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/expressRouteGateways_expressRouteConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/ExpressRoutePorts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/firewallPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/firewallPolicies_ruleGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/ipGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers_inboundNatRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/localNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/natGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/networkInterfaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/networkInterfaces_tapConfigurations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/networkProfiles',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups_securityRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/networkVirtualAppliances',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/networkWatchers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/networkWatchers_connectionMonitors',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/networkWatchers_flowLogs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/networkWatchers_packetCaptures',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/p2svpnGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/privateEndpoints',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/privateLinkServices',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/privateLinkServices_privateEndpointConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/publicIPAddresses',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/publicIPPrefixes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/routeFilters',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/routeFilters_routeFilterRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/routeTables',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/routeTables_routes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/serviceEndpointPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/serviceEndpointPolicies_serviceEndpointPolicyDefinitions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/virtualHubs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/virtualHubs_routeTables',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks_subnets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks_virtualNetworkPeerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworkTaps',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/virtualRouters',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/virtualRouters_peerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/virtualWans',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/vpnGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/vpnGateways_vpnConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/vpnServerConfigurations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-12-01/Microsoft.Network.json#/resourceDefinitions/vpnSites',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/applicationGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/ApplicationGatewayWebApplicationFirewallPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/applicationSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/azureFirewalls',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/bastionHosts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/connections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/ddosCustomPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/ddosProtectionPlans',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_authorizations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_peerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_peerings_connections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCrossConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCrossConnections_peerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/expressRouteGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/expressRouteGateways_expressRouteConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/ExpressRoutePorts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/firewallPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/firewallPolicies_ruleGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/IpAllocations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/ipGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers_inboundNatRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/localNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/natGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/networkInterfaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/networkInterfaces_tapConfigurations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/networkProfiles',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups_securityRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/networkVirtualAppliances',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/networkWatchers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/networkWatchers_connectionMonitors',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/networkWatchers_flowLogs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/networkWatchers_packetCaptures',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/p2svpnGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/privateEndpoints',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/privateEndpoints_privateDnsZoneGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/privateLinkServices',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/privateLinkServices_privateEndpointConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/publicIPAddresses',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/publicIPPrefixes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/routeFilters',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/routeFilters_routeFilterRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/routeTables',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/routeTables_routes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/securityPartnerProviders',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/serviceEndpointPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/serviceEndpointPolicies_serviceEndpointPolicyDefinitions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/virtualHubs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/virtualHubs_routeTables',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks_subnets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks_virtualNetworkPeerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworkTaps',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/virtualRouters',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/virtualRouters_peerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/virtualWans',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/vpnGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/vpnGateways_vpnConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/vpnServerConfigurations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Network.json#/resourceDefinitions/vpnSites',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/applicationGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/ApplicationGatewayWebApplicationFirewallPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/applicationSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/azureFirewalls',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/bastionHosts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/connections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/ddosCustomPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/ddosProtectionPlans',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_authorizations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_peerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_peerings_connections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCrossConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCrossConnections_peerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/expressRouteGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/expressRouteGateways_expressRouteConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/ExpressRoutePorts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/firewallPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/firewallPolicies_ruleGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/IpAllocations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/ipGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers_backendAddressPools',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers_inboundNatRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/localNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/natGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/networkInterfaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/networkInterfaces_tapConfigurations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/networkProfiles',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups_securityRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/networkVirtualAppliances',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/networkWatchers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/networkWatchers_connectionMonitors',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/networkWatchers_flowLogs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/networkWatchers_packetCaptures',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/p2svpnGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/privateEndpoints',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/privateEndpoints_privateDnsZoneGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/privateLinkServices',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/privateLinkServices_privateEndpointConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/publicIPAddresses',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/publicIPPrefixes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/routeFilters',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/routeFilters_routeFilterRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/routeTables',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/routeTables_routes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/securityPartnerProviders',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/serviceEndpointPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/serviceEndpointPolicies_serviceEndpointPolicyDefinitions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/virtualHubs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/virtualHubs_hubRouteTables',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/virtualHubs_routeTables',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks_subnets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks_virtualNetworkPeerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworkTaps',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/virtualRouters',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/virtualRouters_peerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/virtualWans',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/vpnGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/vpnGateways_vpnConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/vpnServerConfigurations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-04-01/Microsoft.Network.json#/resourceDefinitions/vpnSites',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/applicationGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/applicationGateways_privateEndpointConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/ApplicationGatewayWebApplicationFirewallPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/applicationSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/azureFirewalls',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/bastionHosts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/connections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/ddosCustomPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/ddosProtectionPlans',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_authorizations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_peerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCircuits_peerings_connections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCrossConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/expressRouteCrossConnections_peerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/expressRouteGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/expressRouteGateways_expressRouteConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/ExpressRoutePorts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/firewallPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/firewallPolicies_ruleCollectionGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/IpAllocations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/ipGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers_backendAddressPools',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/loadBalancers_inboundNatRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/localNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/natGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/networkInterfaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/networkInterfaces_tapConfigurations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/networkProfiles',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/networkSecurityGroups_securityRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/networkVirtualAppliances',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/networkVirtualAppliances_virtualApplianceSites',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/networkWatchers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/networkWatchers_connectionMonitors',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/networkWatchers_flowLogs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/networkWatchers_packetCaptures',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/p2svpnGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/privateEndpoints',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/privateEndpoints_privateDnsZoneGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/privateLinkServices',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/privateLinkServices_privateEndpointConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/publicIPAddresses',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/publicIPPrefixes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/routeFilters',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/routeFilters_routeFilterRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/routeTables',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/routeTables_routes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/securityPartnerProviders',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/serviceEndpointPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/serviceEndpointPolicies_serviceEndpointPolicyDefinitions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/virtualHubs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/virtualHubs_bgpConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/virtualHubs_hubRouteTables',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/virtualHubs_hubVirtualNetworkConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/virtualHubs_ipConfigurations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/virtualHubs_routeTables',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworkGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks_subnets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworks_virtualNetworkPeerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/virtualNetworkTaps',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/virtualRouters',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/virtualRouters_peerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/virtualWans',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/vpnGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/vpnGateways_vpnConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/vpnServerConfigurations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01/Microsoft.Network.json#/resourceDefinitions/vpnSites',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-11-15-preview/Microsoft.DataMigration.json#/resourceDefinitions/services',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-11-15-preview/Microsoft.DataMigration.json#/resourceDefinitions/services_projects',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-11-15-privatepreview/Microsoft.DataMigration.json#/resourceDefinitions/services',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-11-15-privatepreview/Microsoft.DataMigration.json#/resourceDefinitions/services_projects',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-31/Microsoft.Consumption.json#/resourceDefinitions/budgets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-03-01/Microsoft.BatchAI.json#/resourceDefinitions/clusters',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-03-01/Microsoft.BatchAI.json#/resourceDefinitions/fileServers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-03-01/Microsoft.BatchAI.json#/resourceDefinitions/jobs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-12-01/Microsoft.RecoveryServices.json#/resourceDefinitions/vaults_backupFabrics_protectionContainers_protectedItems',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-12-01/Microsoft.RecoveryServices.json#/resourceDefinitions/vaults_backupPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-07-01/Microsoft.RecoveryServices.json#/resourceDefinitions/vaults_backupFabrics_backupProtectionIntent',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-12-01/Microsoft.RecoveryServices.Backup.json#/resourceDefinitions/vaults_backupFabrics_protectionContainers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-12-01/Microsoft.RecoveryServices.Backup.json#/resourceDefinitions/vaults_backupstorageconfig',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-04-01/Microsoft.Compute.json#/resourceDefinitions/disks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-04-01/Microsoft.Compute.json#/resourceDefinitions/snapshots',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-04-01/Microsoft.ContainerInstance.json#/resourceDefinitions/containerGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-10-01/Microsoft.ContainerInstance.json#/resourceDefinitions/containerGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.Compute.json#/resourceDefinitions/galleries',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.Compute.json#/resourceDefinitions/galleries_images',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.Compute.json#/resourceDefinitions/galleries_images_versions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.Compute.json#/resourceDefinitions/images',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.Compute.json#/resourceDefinitions/availabilitySets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.Compute.json#/resourceDefinitions/virtualMachines',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.Compute.json#/resourceDefinitions/virtualMachineScaleSets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.Compute.json#/resourceDefinitions/disks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.Compute.json#/resourceDefinitions/snapshots',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.Compute.json#/resourceDefinitions/virtualMachineScaleSets_virtualmachines',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.Compute.Extensions.json#/resourceDefinitions/virtualMachines_extensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.Compute.Extensions.json#/resourceDefinitions/virtualMachineScaleSets_extensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-10-01/Microsoft.Compute.json#/resourceDefinitions/images',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-10-01/Microsoft.Compute.json#/resourceDefinitions/availabilitySets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-10-01/Microsoft.Compute.json#/resourceDefinitions/virtualMachines',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-10-01/Microsoft.Compute.json#/resourceDefinitions/virtualMachineScaleSets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-10-01/Microsoft.Compute.json#/resourceDefinitions/virtualMachineScaleSets_virtualmachines',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-10-01/Microsoft.Compute.Extensions.json#/resourceDefinitions/virtualMachines_extensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-10-01/Microsoft.Compute.Extensions.json#/resourceDefinitions/virtualMachineScaleSets_extensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-03-01/Microsoft.Compute.json#/resourceDefinitions/availabilitySets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-03-01/Microsoft.Compute.json#/resourceDefinitions/hostGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-03-01/Microsoft.Compute.json#/resourceDefinitions/hostGroups_hosts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-03-01/Microsoft.Compute.json#/resourceDefinitions/images',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-03-01/Microsoft.Compute.json#/resourceDefinitions/proximityPlacementGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-03-01/Microsoft.Compute.json#/resourceDefinitions/virtualMachines',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-03-01/Microsoft.Compute.json#/resourceDefinitions/virtualMachineScaleSets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-03-01/Microsoft.Compute.json#/resourceDefinitions/virtualMachineScaleSets_virtualmachines',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-03-01/Microsoft.Compute.Extensions.json#/resourceDefinitions/virtualMachines_extensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-03-01/Microsoft.Compute.Extensions.json#/resourceDefinitions/virtualMachineScaleSets_extensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-03-01/Microsoft.Compute.json#/resourceDefinitions/galleries',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-03-01/Microsoft.Compute.json#/resourceDefinitions/galleries_images',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-03-01/Microsoft.Compute.json#/resourceDefinitions/galleries_images_versions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-09-01/Microsoft.IotCentral.json#/resourceDefinitions/iotApps',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-05-01/Microsoft.Maps.json#/resourceDefinitions/accounts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-05-01/Microsoft.BatchAI.json#/resourceDefinitions/workspaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-05-01/Microsoft.BatchAI.json#/resourceDefinitions/workspaces_clusters',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-05-01/Microsoft.BatchAI.json#/resourceDefinitions/workspaces_experiments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-05-01/Microsoft.BatchAI.json#/resourceDefinitions/workspaces_experiments_jobs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-05-01/Microsoft.BatchAI.json#/resourceDefinitions/workspaces_fileServers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-07-01/Microsoft.ContainerService.json#/resourceDefinitions/containerServices',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-03-31/Microsoft.ContainerService.json#/resourceDefinitions/managedClusters',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-03-20/Microsoft.OperationalInsights.json#/resourceDefinitions/workspaces_savedSearches',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-03-20/Microsoft.OperationalInsights.json#/resourceDefinitions/workspaces_storageInsightConfigs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-11-01-preview/Microsoft.OperationalInsights.json#/resourceDefinitions/workspaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-11-01-preview/Microsoft.OperationalInsights.json#/resourceDefinitions/workspaces_dataSources',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-11-01-preview/Microsoft.OperationalInsights.json#/resourceDefinitions/workspaces_linkedServices',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01-preview/Microsoft.OperationalInsights.json#/resourceDefinitions/clusters',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-11-01-preview/Microsoft.OperationsManagement.json#/resourceDefinitions/ManagementConfigurations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-11-01-preview/Microsoft.OperationsManagement.json#/resourceDefinitions/solutions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01-preview/Microsoft.Peering.json#/resourceDefinitions/peerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01-preview/Microsoft.Peering.json#/resourceDefinitions/peeringServices',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01-preview/Microsoft.Peering.json#/resourceDefinitions/peeringServices_prefixes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01-preview/Microsoft.Peering.json#/resourceDefinitions/peerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01-preview/Microsoft.Peering.json#/resourceDefinitions/peeringServices',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01-preview/Microsoft.Peering.json#/resourceDefinitions/peeringServices_prefixes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-01-01-preview/Microsoft.Peering.json#/resourceDefinitions/peerings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-01-01-preview/Microsoft.Peering.json#/resourceDefinitions/peerings_registeredAsns',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-01-01-preview/Microsoft.Peering.json#/resourceDefinitions/peerings_registeredPrefixes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-01-01-preview/Microsoft.Peering.json#/resourceDefinitions/peeringServices',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-01-01-preview/Microsoft.Peering.json#/resourceDefinitions/peeringServices_prefixes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-01-01/Microsoft.AAD.json#/resourceDefinitions/domainServices',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-06-01/Microsoft.AAD.json#/resourceDefinitions/domainServices',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-06-01/Microsoft.AAD.json#/resourceDefinitions/domainServices_ouContainer',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-10-01/Microsoft.SignalRService.json#/resourceDefinitions/signalR',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-08-15/Microsoft.NetApp.json#/resourceDefinitions/netAppAccounts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-08-15/Microsoft.NetApp.json#/resourceDefinitions/netAppAccounts_capacityPools',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-08-15/Microsoft.NetApp.json#/resourceDefinitions/netAppAccounts_capacityPools_volumes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-08-15/Microsoft.NetApp.json#/resourceDefinitions/netAppAccounts_capacityPools_volumes_snapshots',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-05-01/Microsoft.NetApp.json#/resourceDefinitions/netAppAccounts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-05-01/Microsoft.NetApp.json#/resourceDefinitions/netAppAccounts_capacityPools',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-05-01/Microsoft.NetApp.json#/resourceDefinitions/netAppAccounts_capacityPools_volumes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-05-01/Microsoft.NetApp.json#/resourceDefinitions/netAppAccounts_capacityPools_volumes_snapshots',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-10-01/Microsoft.StorSimple.1200.json#/resourceDefinitions/managers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-10-01/Microsoft.StorSimple.1200.json#/resourceDefinitions/managers_accessControlRecords',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-10-01/Microsoft.StorSimple.1200.json#/resourceDefinitions/managers_certificates',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-10-01/Microsoft.StorSimple.1200.json#/resourceDefinitions/managers_devices_alertSettings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-10-01/Microsoft.StorSimple.1200.json#/resourceDefinitions/managers_devices_backupScheduleGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-10-01/Microsoft.StorSimple.1200.json#/resourceDefinitions/managers_devices_chapSettings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-10-01/Microsoft.StorSimple.1200.json#/resourceDefinitions/managers_devices_fileservers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-10-01/Microsoft.StorSimple.1200.json#/resourceDefinitions/managers_devices_fileservers_shares',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-10-01/Microsoft.StorSimple.1200.json#/resourceDefinitions/managers_devices_iscsiservers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-10-01/Microsoft.StorSimple.1200.json#/resourceDefinitions/managers_devices_iscsiservers_disks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-10-01/Microsoft.StorSimple.1200.json#/resourceDefinitions/managers_extendedInformation',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-10-01/Microsoft.StorSimple.1200.json#/resourceDefinitions/managers_storageAccountCredentials',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-10-01/Microsoft.StorSimple.1200.json#/resourceDefinitions/managers_storageDomains',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-01-01-preview/Microsoft.Maps.json#/resourceDefinitions/accounts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-05-01/Microsoft.Maps.json#/resourceDefinitions/accounts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-02-01-preview/Microsoft.Maps.json#/resourceDefinitions/accounts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-02-01-preview/Microsoft.Maps.json#/resourceDefinitions/accounts_privateAtlases',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-31-preview/Microsoft.ManagedIdentity.json#/resourceDefinitions/userAssignedIdentities',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-30/Microsoft.ManagedIdentity.json#/resourceDefinitions/userAssignedIdentities',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-03-01-preview/Microsoft.HDInsight.json#/resourceDefinitions/clusters',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-03-01-preview/Microsoft.HDInsight.json#/resourceDefinitions/clusters_applications',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-03-01-preview/Microsoft.HDInsight.json#/resourceDefinitions/clusters_extensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01-preview/Microsoft.HDInsight.json#/resourceDefinitions/clusters',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01-preview/Microsoft.HDInsight.json#/resourceDefinitions/clusters_applications',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01-preview/Microsoft.HDInsight.json#/resourceDefinitions/clusters_extensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-06-01-preview/Microsoft.Security.json#/resourceDefinitions/locations_jitNetworkAccessPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-08-01-preview/Microsoft.Security.json#/resourceDefinitions/iotSecuritySolutions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-08-01-preview/Microsoft.Security.json#/resourceDefinitions/pricings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-08-01-preview/Microsoft.Security.json#/unknown_resourceDefinitions/advancedThreatProtectionSettings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-08-01-preview/Microsoft.Security.json#/unknown_resourceDefinitions/deviceSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-01-01/Microsoft.Security.json#/unknown_resourceDefinitions/advancedThreatProtectionSettings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-01-01-preview/Microsoft.Security.json#/resourceDefinitions/automations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-01-01-preview/Microsoft.Security.json#/unknown_resourceDefinitions/assessments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Security.json#/resourceDefinitions/iotSecuritySolutions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Security.json#/unknown_resourceDefinitions/deviceSecurityGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-01-01/Microsoft.Security.json#/resourceDefinitions/locations_jitNetworkAccessPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-01-01/Microsoft.Security.json#/unknown_resourceDefinitions/assessments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-10-01/Microsoft.Migrate.Migrate.json#/resourceDefinitions/assessmentProjects',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-10-01/Microsoft.Migrate.Migrate.json#/resourceDefinitions/assessmentProjects_groups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-10-01/Microsoft.Migrate.Migrate.json#/resourceDefinitions/assessmentProjects_groups_assessments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-10-01/Microsoft.Migrate.Migrate.json#/resourceDefinitions/assessmentProjects_hypervcollectors',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-10-01/Microsoft.Migrate.Migrate.json#/resourceDefinitions/assessmentProjects_vmwarecollectors',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01-preview/Microsoft.ManagedServices.json#/resourceDefinitions/registrationAssignments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01-preview/Microsoft.ManagedServices.json#/resourceDefinitions/registrationDefinitions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.ManagedServices.json#/resourceDefinitions/registrationAssignments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.ManagedServices.json#/resourceDefinitions/registrationDefinitions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-09-01-preview/Microsoft.BareMetal.json#/resourceDefinitions/crayServers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.ContainerService.json#/resourceDefinitions/managedClusters',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.ContainerService.json#/resourceDefinitions/managedClusters_agentPools',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-09-01-preview/Microsoft.Migrate.MigrateProjects.json#/resourceDefinitions/migrateProjects',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-09-01-preview/Microsoft.Migrate.MigrateProjects.json#/resourceDefinitions/migrateProjects_solutions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-01/Microsoft.ServiceBus.json#/resourceDefinitions/namespaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-01/Microsoft.ServiceBus.json#/resourceDefinitions/namespaces_AuthorizationRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-01/Microsoft.ServiceBus.json#/resourceDefinitions/namespaces_queues',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-01/Microsoft.ServiceBus.json#/resourceDefinitions/namespaces_queues_authorizationRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-01/Microsoft.ServiceBus.json#/resourceDefinitions/namespaces_topics',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-01/Microsoft.ServiceBus.json#/resourceDefinitions/namespaces_topics_authorizationRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-01/Microsoft.ServiceBus.json#/resourceDefinitions/namespaces_topics_subscriptions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-04-01/Microsoft.ServiceBus.json#/resourceDefinitions/namespaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-04-01/Microsoft.ServiceBus.json#/resourceDefinitions/namespaces_AuthorizationRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-04-01/Microsoft.ServiceBus.json#/resourceDefinitions/namespaces_disasterRecoveryConfigs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-04-01/Microsoft.ServiceBus.json#/resourceDefinitions/namespaces_migrationConfigurations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-04-01/Microsoft.ServiceBus.json#/resourceDefinitions/namespaces_networkRuleSets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-04-01/Microsoft.ServiceBus.json#/resourceDefinitions/namespaces_queues',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-04-01/Microsoft.ServiceBus.json#/resourceDefinitions/namespaces_queues_authorizationRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-04-01/Microsoft.ServiceBus.json#/resourceDefinitions/namespaces_topics',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-04-01/Microsoft.ServiceBus.json#/resourceDefinitions/namespaces_topics_authorizationRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-04-01/Microsoft.ServiceBus.json#/resourceDefinitions/namespaces_topics_subscriptions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-04-01/Microsoft.ServiceBus.json#/resourceDefinitions/namespaces_topics_subscriptions_rules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01-preview/Microsoft.ServiceBus.json#/resourceDefinitions/namespaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01-preview/Microsoft.ServiceBus.json#/resourceDefinitions/namespaces_ipfilterrules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01-preview/Microsoft.ServiceBus.json#/resourceDefinitions/namespaces_networkRuleSets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01-preview/Microsoft.ServiceBus.json#/resourceDefinitions/namespaces_virtualnetworkrules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01-preview/Microsoft.ServiceBus.json#/resourceDefinitions/namespaces_privateEndpointConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01-preview/Microsoft.ServiceBus.json#/resourceDefinitions/namespaces_queues',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01-preview/Microsoft.ServiceBus.json#/resourceDefinitions/namespaces_queues_authorizationRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01-preview/Microsoft.ServiceBus.json#/resourceDefinitions/namespaces_topics',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01-preview/Microsoft.ServiceBus.json#/resourceDefinitions/namespaces_topics_authorizationRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01-preview/Microsoft.ServiceBus.json#/resourceDefinitions/namespaces_topics_subscriptions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01-preview/Microsoft.ServiceBus.json#/resourceDefinitions/namespaces_topics_subscriptions_rules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01-preview/Microsoft.ServiceBus.json#/resourceDefinitions/namespaces_disasterRecoveryConfigs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01-preview/Microsoft.ServiceBus.json#/resourceDefinitions/namespaces_migrationConfigurations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01-preview/Microsoft.ServiceBus.json#/resourceDefinitions/namespaces_AuthorizationRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2014-04-01-preview/Microsoft.VisualStudio.json#/resourceDefinitions/account',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2014-04-01-preview/Microsoft.VisualStudio.json#/resourceDefinitions/account_extension',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2014-04-01-preview/Microsoft.VisualStudio.json#/resourceDefinitions/account_project',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2014-09-01/Microsoft.EventHub.json#/resourceDefinitions/namespaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2014-09-01/Microsoft.EventHub.json#/resourceDefinitions/namespaces_AuthorizationRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2014-09-01/Microsoft.EventHub.json#/resourceDefinitions/namespaces_eventhubs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2014-09-01/Microsoft.EventHub.json#/resourceDefinitions/namespaces_eventhubs_authorizationRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2014-09-01/Microsoft.EventHub.json#/resourceDefinitions/namespaces_eventhubs_consumergroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-01/Microsoft.EventHub.json#/resourceDefinitions/namespaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-01/Microsoft.EventHub.json#/resourceDefinitions/namespaces_AuthorizationRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-01/Microsoft.EventHub.json#/resourceDefinitions/namespaces_eventhubs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-01/Microsoft.EventHub.json#/resourceDefinitions/namespaces_eventhubs_authorizationRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-01/Microsoft.EventHub.json#/resourceDefinitions/namespaces_eventhubs_consumergroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-04-01/Microsoft.EventHub.json#/resourceDefinitions/namespaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-04-01/Microsoft.EventHub.json#/resourceDefinitions/namespaces_authorizationRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-04-01/Microsoft.EventHub.json#/resourceDefinitions/namespaces_disasterRecoveryConfigs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-04-01/Microsoft.EventHub.json#/resourceDefinitions/namespaces_eventhubs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-04-01/Microsoft.EventHub.json#/resourceDefinitions/namespaces_eventhubs_authorizationRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-04-01/Microsoft.EventHub.json#/resourceDefinitions/namespaces_eventhubs_consumergroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-04-01/Microsoft.EventHub.json#/resourceDefinitions/namespaces_networkRuleSets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01-preview/Microsoft.EventHub.json#/resourceDefinitions/clusters',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01-preview/Microsoft.EventHub.json#/resourceDefinitions/namespaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01-preview/Microsoft.EventHub.json#/resourceDefinitions/namespaces_ipfilterrules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01-preview/Microsoft.EventHub.json#/resourceDefinitions/namespaces_networkRuleSets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01-preview/Microsoft.EventHub.json#/resourceDefinitions/namespaces_virtualnetworkrules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-07-01/Microsoft.Relay.json#/resourceDefinitions/namespaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-07-01/Microsoft.Relay.json#/resourceDefinitions/namespaces_AuthorizationRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-07-01/Microsoft.Relay.json#/resourceDefinitions/namespaces_HybridConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-07-01/Microsoft.Relay.json#/resourceDefinitions/namespaces_HybridConnections_authorizationRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-07-01/Microsoft.Relay.json#/resourceDefinitions/namespaces_WcfRelays',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-07-01/Microsoft.Relay.json#/resourceDefinitions/namespaces_WcfRelays_authorizationRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-04-01/Microsoft.Relay.json#/resourceDefinitions/namespaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-04-01/Microsoft.Relay.json#/resourceDefinitions/namespaces_authorizationRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-04-01/Microsoft.Relay.json#/resourceDefinitions/namespaces_hybridConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-04-01/Microsoft.Relay.json#/resourceDefinitions/namespaces_hybridConnections_authorizationRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-04-01/Microsoft.Relay.json#/resourceDefinitions/namespaces_wcfRelays',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-04-01/Microsoft.Relay.json#/resourceDefinitions/namespaces_wcfRelays_authorizationRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-09-01-preview/Microsoft.DataFactory.json#/resourceDefinitions/factories',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-09-01-preview/Microsoft.DataFactory.json#/resourceDefinitions/factories_datasets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-09-01-preview/Microsoft.DataFactory.json#/resourceDefinitions/factories_integrationRuntimes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-09-01-preview/Microsoft.DataFactory.json#/resourceDefinitions/factories_linkedservices',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-09-01-preview/Microsoft.DataFactory.json#/resourceDefinitions/factories_pipelines',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-09-01-preview/Microsoft.DataFactory.json#/resourceDefinitions/factories_triggers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.DataFactory.json#/resourceDefinitions/factories',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.DataFactory.json#/resourceDefinitions/factories_dataflows',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.DataFactory.json#/resourceDefinitions/factories_datasets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.DataFactory.json#/resourceDefinitions/factories_integrationRuntimes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.DataFactory.json#/resourceDefinitions/factories_linkedservices',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.DataFactory.json#/resourceDefinitions/factories_pipelines',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.DataFactory.json#/resourceDefinitions/factories_triggers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.DataFactory.json#/resourceDefinitions/factories_managedVirtualNetworks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01/Microsoft.DataFactory.json#/resourceDefinitions/factories_managedVirtualNetworks_managedPrivateEndpoints',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-06-15-preview/Microsoft.EventGrid.json#/resourceDefinitions/topics',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-06-15-preview/Microsoft.EventGrid.json#/unknown_resourceDefinitions/eventSubscriptions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-09-15-preview/Microsoft.EventGrid.json#/resourceDefinitions/topics',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-09-15-preview/Microsoft.EventGrid.json#/unknown_resourceDefinitions/eventSubscriptions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.EventGrid.json#/resourceDefinitions/topics',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-01-01/Microsoft.EventGrid.json#/unknown_resourceDefinitions/eventSubscriptions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-05-01-preview/Microsoft.EventGrid.json#/resourceDefinitions/topics',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-05-01-preview/Microsoft.EventGrid.json#/unknown_resourceDefinitions/eventSubscriptions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-09-15-preview/Microsoft.EventGrid.json#/resourceDefinitions/domains',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-09-15-preview/Microsoft.EventGrid.json#/resourceDefinitions/topics',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-09-15-preview/Microsoft.EventGrid.json#/unknown_resourceDefinitions/eventSubscriptions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-01-01/Microsoft.EventGrid.json#/resourceDefinitions/topics',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-01-01/Microsoft.EventGrid.json#/unknown_resourceDefinitions/eventSubscriptions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-02-01-preview/Microsoft.EventGrid.json#/resourceDefinitions/domains',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-02-01-preview/Microsoft.EventGrid.json#/resourceDefinitions/domains_topics',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-02-01-preview/Microsoft.EventGrid.json#/resourceDefinitions/topics',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-02-01-preview/Microsoft.EventGrid.json#/unknown_resourceDefinitions/eventSubscriptions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.EventGrid.json#/resourceDefinitions/domains',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.EventGrid.json#/resourceDefinitions/domains_topics',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.EventGrid.json#/resourceDefinitions/topics',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.EventGrid.json#/unknown_resourceDefinitions/eventSubscriptions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Compute.json#/resourceDefinitions/availabilitySets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Compute.json#/resourceDefinitions/diskEncryptionSets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Compute.json#/resourceDefinitions/disks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Compute.json#/resourceDefinitions/hostGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Compute.json#/resourceDefinitions/hostGroups_hosts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Compute.json#/resourceDefinitions/images',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Compute.json#/resourceDefinitions/proximityPlacementGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Compute.json#/resourceDefinitions/snapshots',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Compute.json#/resourceDefinitions/virtualMachines',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Compute.json#/resourceDefinitions/virtualMachineScaleSets',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Compute.json#/resourceDefinitions/virtualMachineScaleSets_virtualmachines',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Compute.json#/resourceDefinitions/virtualMachineScaleSets_virtualMachines_extensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Compute.Extensions.json#/resourceDefinitions/virtualMachines_extensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-07-01/Microsoft.Compute.Extensions.json#/resourceDefinitions/virtualMachineScaleSets_extensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-16-preview/Microsoft.WindowsESU.json#/resourceDefinitions/multipleActivationKeys',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2014-08-01-preview/Microsoft.Scheduler.json#/resourceDefinitions/jobCollections_jobs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-01-01/Microsoft.Scheduler.json#/resourceDefinitions/jobCollections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-01-01/Microsoft.Scheduler.json#/resourceDefinitions/jobCollections_jobs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-02-28/Microsoft.Search.json#/resourceDefinitions/searchServices',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-10-01-preview/Microsoft.Search.json#/resourceDefinitions/searchServices',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-10-01-preview/Microsoft.Search.json#/resourceDefinitions/searchServices_privateEndpointConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01-preview/Microsoft.Synapse.json#/resourceDefinitions/workspaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01-preview/Microsoft.Synapse.json#/resourceDefinitions/workspaces_administrators',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01-preview/Microsoft.Synapse.json#/resourceDefinitions/workspaces_bigDataPools',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01-preview/Microsoft.Synapse.json#/resourceDefinitions/workspaces_firewallRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01-preview/Microsoft.Synapse.json#/resourceDefinitions/workspaces_managedIdentitySqlControlSettings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01-preview/Microsoft.Synapse.json#/resourceDefinitions/workspaces_sqlPools',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01-preview/Microsoft.Synapse.json#/resourceDefinitions/workspaces_sqlPools_auditingSettings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01-preview/Microsoft.Synapse.json#/resourceDefinitions/workspaces_sqlPools_metadataSync',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01-preview/Microsoft.Synapse.json#/resourceDefinitions/workspaces_sqlPools_schemas_tables_columns_sensitivityLabels',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01-preview/Microsoft.Synapse.json#/resourceDefinitions/workspaces_sqlPools_securityAlertPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01-preview/Microsoft.Synapse.json#/resourceDefinitions/workspaces_sqlPools_transparentDataEncryption',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01-preview/Microsoft.Synapse.json#/resourceDefinitions/workspaces_sqlPools_vulnerabilityAssessments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01-preview/Microsoft.Synapse.json#/resourceDefinitions/workspaces_sqlPools_vulnerabilityAssessments_rules_baselines',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-09-01-preview/Microsoft.ResourceGraph.json#/resourceDefinitions/queries',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-08-20-preview/Microsoft.Communication.json#/resourceDefinitions/communicationServices',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2014-04-01/Microsoft.Insights.json#/resourceDefinitions/alertrules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2014-04-01/Microsoft.Insights.ManuallyAuthored.json#/resourceDefinitions/components',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2014-04-01/Microsoft.Insights.ManuallyAuthored.json#/resourceDefinitions/webtests',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2014-04-01/Microsoft.Insights.ManuallyAuthored.json#/resourceDefinitions/autoscalesettings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-05-01/Microsoft.Insights.Application.json#/resourceDefinitions/components',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-05-01/Microsoft.Insights.Application.json#/resourceDefinitions/components_analyticsItems',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-05-01/Microsoft.Insights.Application.json#/resourceDefinitions/components_Annotations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-05-01/Microsoft.Insights.Application.json#/resourceDefinitions/components_currentbillingfeatures',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-05-01/Microsoft.Insights.Application.json#/resourceDefinitions/components_favorites',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-05-01/Microsoft.Insights.Application.json#/resourceDefinitions/components_myanalyticsItems',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-05-01/Microsoft.Insights.Application.json#/resourceDefinitions/components_ProactiveDetectionConfigs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-05-01/Microsoft.Insights.Application.json#/resourceDefinitions/myWorkbooks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-05-01/Microsoft.Insights.Application.json#/resourceDefinitions/webtests',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-05-01/Microsoft.Insights.Application.json#/resourceDefinitions/workbooks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-05-01/Microsoft.Insights.Application.json#/resourceDefinitions/components_exportconfiguration',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-10-01/Microsoft.Insights.Application.json#/resourceDefinitions/components_pricingPlans',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-05-01-preview/Microsoft.Insights.Application.json#/resourceDefinitions/components',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-05-01-preview/Microsoft.Insights.Application.json#/resourceDefinitions/components_ProactiveDetectionConfigs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-17-preview/Microsoft.Insights.Application.json#/resourceDefinitions/workbooks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-10-17-preview/Microsoft.Insights.Application.json#/resourceDefinitions/workbooktemplates',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-02-02-preview/Microsoft.Insights.Application.json#/resourceDefinitions/components',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01-preview/Microsoft.Insights.Application.json#/resourceDefinitions/components_linkedStorageAccounts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-04-01/Microsoft.Insights.json#/resourceDefinitions/autoscalesettings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-03-01/Microsoft.Insights.json#/resourceDefinitions/alertrules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-03-01-preview/Microsoft.Insights.json#/resourceDefinitions/activityLogAlerts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-04-01/Microsoft.Insights.json#/resourceDefinitions/actionGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-04-01/Microsoft.Insights.json#/resourceDefinitions/activityLogAlerts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-03-01/Microsoft.Insights.json#/resourceDefinitions/actionGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-03-01/Microsoft.Insights.json#/resourceDefinitions/metricAlerts',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-04-16/Microsoft.Insights.json#/resourceDefinitions/scheduledQueryRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-06-01-preview/Microsoft.Insights.json#/resourceDefinitions/guestDiagnosticSettings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-09-01/Microsoft.Insights.json#/resourceDefinitions/actionGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-03-01/Microsoft.Insights.json#/resourceDefinitions/actionGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Insights.json#/resourceDefinitions/actionGroups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-10-17-preview/Microsoft.Insights.json#/resourceDefinitions/privateLinkScopes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-10-17-preview/Microsoft.Insights.json#/resourceDefinitions/privateLinkScopes_privateEndpointConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-10-17-preview/Microsoft.Insights.json#/resourceDefinitions/privateLinkScopes_scopedResources',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-01-preview/Microsoft.Insights.json#/resourceDefinitions/dataCollectionRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-05-01-preview/Microsoft.Insights.json#/resourceDefinitions/scheduledQueryRules',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-11-04-preview/Microsoft.Quantum.json#/resourceDefinitions/workspaces',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-01-01/Microsoft.Authorization.Resources.json#/resourceDefinitions/locks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-10-01-preview/Microsoft.Authorization.Resources.json#/unknown_resourceDefinitions/policyassignments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-04-01/Microsoft.Authorization.Resources.json#/unknown_resourceDefinitions/policyassignments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-09-01/Microsoft.Authorization.Resources.json#/resourceDefinitions/locks',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-12-01/Microsoft.Authorization.Resources.json#/unknown_resourceDefinitions/policyAssignments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2017-06-01-preview/Microsoft.Authorization.Resources.json#/unknown_resourceDefinitions/policyAssignments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-03-01/Microsoft.Authorization.Resources.json#/unknown_resourceDefinitions/policyAssignments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-05-01/Microsoft.Authorization.Resources.json#/unknown_resourceDefinitions/policyAssignments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-01-01/Microsoft.Authorization.Resources.json#/unknown_resourceDefinitions/policyAssignments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-06-01/Microsoft.Authorization.Resources.json#/unknown_resourceDefinitions/policyAssignments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-09-01/Microsoft.Authorization.Resources.json#/unknown_resourceDefinitions/policyAssignments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-03-01/Microsoft.Authorization.Resources.json#/unknown_resourceDefinitions/policyAssignments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-07-01-preview/Microsoft.Authorization.Resources.json#/unknown_resourceDefinitions/policyExemptions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.Authorization.Resources.json#/unknown_resourceDefinitions/policyAssignments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-01/Microsoft.CertificateRegistration.json#/resourceDefinitions/certificateOrders',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-01/Microsoft.CertificateRegistration.json#/resourceDefinitions/certificateOrders_certificates',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.CertificateRegistration.json#/resourceDefinitions/certificateOrders',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.CertificateRegistration.json#/resourceDefinitions/certificateOrders_certificates',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.CertificateRegistration.json#/resourceDefinitions/certificateOrders',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.CertificateRegistration.json#/resourceDefinitions/certificateOrders_certificates',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.CertificateRegistration.json#/resourceDefinitions/certificateOrders',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.CertificateRegistration.json#/resourceDefinitions/certificateOrders_certificates',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.CertificateRegistration.json#/resourceDefinitions/certificateOrders',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.CertificateRegistration.json#/resourceDefinitions/certificateOrders_certificates',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.CertificateRegistration.json#/resourceDefinitions/certificateOrders',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.CertificateRegistration.json#/resourceDefinitions/certificateOrders_certificates',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.CertificateRegistration.json#/resourceDefinitions/certificateOrders',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.CertificateRegistration.json#/resourceDefinitions/certificateOrders_certificates',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-04-01/Microsoft.DomainRegistration.json#/resourceDefinitions/domains',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-04-01/Microsoft.DomainRegistration.json#/resourceDefinitions/domains_domainOwnershipIdentifiers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.DomainRegistration.json#/resourceDefinitions/domains',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.DomainRegistration.json#/resourceDefinitions/domains_domainOwnershipIdentifiers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.DomainRegistration.json#/resourceDefinitions/domains',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.DomainRegistration.json#/resourceDefinitions/domains_domainOwnershipIdentifiers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.DomainRegistration.json#/resourceDefinitions/domains',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.DomainRegistration.json#/resourceDefinitions/domains_domainOwnershipIdentifiers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.DomainRegistration.json#/resourceDefinitions/domains',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.DomainRegistration.json#/resourceDefinitions/domains_domainOwnershipIdentifiers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.DomainRegistration.json#/resourceDefinitions/domains',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.DomainRegistration.json#/resourceDefinitions/domains_domainOwnershipIdentifiers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.DomainRegistration.json#/resourceDefinitions/domains',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.DomainRegistration.json#/resourceDefinitions/domains_domainOwnershipIdentifiers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-01/Microsoft.Web.json#/resourceDefinitions/certificates',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-01/Microsoft.Web.json#/resourceDefinitions/csrs',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-01/Microsoft.Web.json#/resourceDefinitions/hostingEnvironments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-01/Microsoft.Web.json#/resourceDefinitions/hostingEnvironments_multiRolePools',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-01/Microsoft.Web.json#/resourceDefinitions/hostingEnvironments_workerPools',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-01/Microsoft.Web.json#/resourceDefinitions/managedHostingEnvironments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-01/Microsoft.Web.json#/resourceDefinitions/serverfarms',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-01/Microsoft.Web.json#/resourceDefinitions/serverfarms_virtualNetworkConnections_gateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-01/Microsoft.Web.json#/resourceDefinitions/serverfarms_virtualNetworkConnections_routes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-01/Microsoft.Web.json#/resourceDefinitions/sites',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-01/Microsoft.Web.json#/resourceDefinitions/sites_backups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-01/Microsoft.Web.json#/resourceDefinitions/sites_config',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-01/Microsoft.Web.json#/resourceDefinitions/sites_deployments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-01/Microsoft.Web.json#/resourceDefinitions/sites_hostNameBindings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-01/Microsoft.Web.json#/resourceDefinitions/sites_hybridconnection',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-01/Microsoft.Web.json#/resourceDefinitions/sites_instances_deployments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-01/Microsoft.Web.json#/resourceDefinitions/sites_premieraddons',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-01/Microsoft.Web.json#/resourceDefinitions/sites_slots',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_backups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_config',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_deployments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_hostNameBindings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_hybridconnection',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_instances_deployments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_premieraddons',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_snapshots',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_sourcecontrols',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_virtualNetworkConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_virtualNetworkConnections_gateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-01/Microsoft.Web.json#/resourceDefinitions/sites_snapshots',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-01/Microsoft.Web.json#/resourceDefinitions/sites_sourcecontrols',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-01/Microsoft.Web.json#/resourceDefinitions/sites_virtualNetworkConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-01/Microsoft.Web.json#/resourceDefinitions/sites_virtualNetworkConnections_gateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-08-01-preview/Microsoft.Web.json#/resourceDefinitions/connections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-03-01/Microsoft.Web.json#/resourceDefinitions/certificates',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-06-01/Microsoft.Web.json#/resourceDefinitions/connectionGateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-06-01/Microsoft.Web.json#/resourceDefinitions/connections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-06-01/Microsoft.Web.json#/resourceDefinitions/customApis',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-08-01/Microsoft.Web.json#/resourceDefinitions/sites',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-08-01/Microsoft.Web.json#/resourceDefinitions/sites_backups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-08-01/Microsoft.Web.json#/resourceDefinitions/sites_config',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-08-01/Microsoft.Web.json#/resourceDefinitions/sites_deployments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-08-01/Microsoft.Web.json#/resourceDefinitions/sites_domainOwnershipIdentifiers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-08-01/Microsoft.Web.json#/resourceDefinitions/sites_extensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-08-01/Microsoft.Web.json#/resourceDefinitions/sites_functions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-08-01/Microsoft.Web.json#/resourceDefinitions/sites_hostNameBindings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-08-01/Microsoft.Web.json#/resourceDefinitions/sites_hybridconnection',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-08-01/Microsoft.Web.json#/resourceDefinitions/sites_hybridConnectionNamespaces_relays',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-08-01/Microsoft.Web.json#/resourceDefinitions/sites_instances_extensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-08-01/Microsoft.Web.json#/resourceDefinitions/sites_migrate',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-08-01/Microsoft.Web.json#/resourceDefinitions/sites_premieraddons',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-08-01/Microsoft.Web.json#/resourceDefinitions/sites_publicCertificates',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-08-01/Microsoft.Web.json#/resourceDefinitions/sites_siteextensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-08-01/Microsoft.Web.json#/resourceDefinitions/sites_slots',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-08-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_backups',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-08-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_config',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-08-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_deployments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-08-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_domainOwnershipIdentifiers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-08-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_extensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-08-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_functions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-08-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_hostNameBindings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-08-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_hybridconnection',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-08-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_hybridConnectionNamespaces_relays',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-08-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_instances_extensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-08-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_premieraddons',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-08-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_publicCertificates',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-08-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_siteextensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-08-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_sourcecontrols',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-08-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_virtualNetworkConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-08-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_virtualNetworkConnections_gateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-08-01/Microsoft.Web.json#/resourceDefinitions/sites_sourcecontrols',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-08-01/Microsoft.Web.json#/resourceDefinitions/sites_virtualNetworkConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-08-01/Microsoft.Web.json#/resourceDefinitions/sites_virtualNetworkConnections_gateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-09-01/Microsoft.Web.json#/resourceDefinitions/hostingEnvironments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-09-01/Microsoft.Web.json#/resourceDefinitions/hostingEnvironments_multiRolePools',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-09-01/Microsoft.Web.json#/resourceDefinitions/hostingEnvironments_workerPools',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-09-01/Microsoft.Web.json#/resourceDefinitions/serverfarms',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-09-01/Microsoft.Web.json#/resourceDefinitions/serverfarms_virtualNetworkConnections_gateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-09-01/Microsoft.Web.json#/resourceDefinitions/serverfarms_virtualNetworkConnections_routes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Web.json#/resourceDefinitions/certificates',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Web.json#/resourceDefinitions/hostingEnvironments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Web.json#/resourceDefinitions/hostingEnvironments_multiRolePools',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Web.json#/resourceDefinitions/hostingEnvironments_workerPools',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Web.json#/resourceDefinitions/serverfarms',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Web.json#/resourceDefinitions/serverfarms_virtualNetworkConnections_gateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Web.json#/resourceDefinitions/serverfarms_virtualNetworkConnections_routes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Web.json#/resourceDefinitions/sites',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Web.json#/resourceDefinitions/sites_config',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Web.json#/resourceDefinitions/sites_deployments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Web.json#/resourceDefinitions/sites_domainOwnershipIdentifiers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Web.json#/resourceDefinitions/sites_extensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Web.json#/resourceDefinitions/sites_functions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Web.json#/resourceDefinitions/sites_functions_keys',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Web.json#/resourceDefinitions/sites_hostNameBindings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Web.json#/resourceDefinitions/sites_hybridconnection',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Web.json#/resourceDefinitions/sites_hybridConnectionNamespaces_relays',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Web.json#/resourceDefinitions/sites_instances_extensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Web.json#/resourceDefinitions/sites_migrate',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Web.json#/resourceDefinitions/sites_networkConfig',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Web.json#/resourceDefinitions/sites_premieraddons',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Web.json#/resourceDefinitions/sites_privateAccess',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Web.json#/resourceDefinitions/sites_publicCertificates',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Web.json#/resourceDefinitions/sites_siteextensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Web.json#/resourceDefinitions/sites_slots',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_config',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_deployments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_domainOwnershipIdentifiers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_extensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_functions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_functions_keys',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_hostNameBindings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_hybridconnection',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_hybridConnectionNamespaces_relays',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_instances_extensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_networkConfig',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_premieraddons',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_privateAccess',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_publicCertificates',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_siteextensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_sourcecontrols',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_virtualNetworkConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_virtualNetworkConnections_gateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Web.json#/resourceDefinitions/sites_sourcecontrols',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Web.json#/resourceDefinitions/sites_virtualNetworkConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-02-01/Microsoft.Web.json#/resourceDefinitions/sites_virtualNetworkConnections_gateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Web.json#/resourceDefinitions/certificates',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Web.json#/resourceDefinitions/sites',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Web.json#/resourceDefinitions/sites_config',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Web.json#/resourceDefinitions/sites_deployments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Web.json#/resourceDefinitions/sites_domainOwnershipIdentifiers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Web.json#/resourceDefinitions/sites_extensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Web.json#/resourceDefinitions/sites_functions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Web.json#/resourceDefinitions/sites_hostNameBindings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Web.json#/resourceDefinitions/sites_hybridconnection',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Web.json#/resourceDefinitions/sites_hybridConnectionNamespaces_relays',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Web.json#/resourceDefinitions/sites_instances_extensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Web.json#/resourceDefinitions/sites_migrate',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Web.json#/resourceDefinitions/sites_networkConfig',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Web.json#/resourceDefinitions/sites_premieraddons',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Web.json#/resourceDefinitions/sites_privateAccess',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Web.json#/resourceDefinitions/sites_publicCertificates',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Web.json#/resourceDefinitions/sites_siteextensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Web.json#/resourceDefinitions/sites_slots',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_config',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_deployments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_domainOwnershipIdentifiers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_extensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_functions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_hostNameBindings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_hybridconnection',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_hybridConnectionNamespaces_relays',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_instances_extensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_networkConfig',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_premieraddons',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_privateAccess',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_publicCertificates',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_siteextensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_sourcecontrols',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_virtualNetworkConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_virtualNetworkConnections_gateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Web.json#/resourceDefinitions/sites_sourcecontrols',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Web.json#/resourceDefinitions/sites_virtualNetworkConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-11-01/Microsoft.Web.json#/resourceDefinitions/sites_virtualNetworkConnections_gateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Web.json#/resourceDefinitions/certificates',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Web.json#/resourceDefinitions/hostingEnvironments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Web.json#/resourceDefinitions/hostingEnvironments_multiRolePools',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Web.json#/resourceDefinitions/hostingEnvironments_workerPools',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Web.json#/resourceDefinitions/serverfarms',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Web.json#/resourceDefinitions/serverfarms_virtualNetworkConnections_gateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Web.json#/resourceDefinitions/serverfarms_virtualNetworkConnections_routes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Web.json#/resourceDefinitions/sites',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Web.json#/resourceDefinitions/sites_basicPublishingCredentialsPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Web.json#/resourceDefinitions/sites_config',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Web.json#/resourceDefinitions/sites_deployments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Web.json#/resourceDefinitions/sites_domainOwnershipIdentifiers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Web.json#/resourceDefinitions/sites_extensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Web.json#/resourceDefinitions/sites_functions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Web.json#/resourceDefinitions/sites_functions_keys',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Web.json#/resourceDefinitions/sites_hostNameBindings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Web.json#/resourceDefinitions/sites_hybridconnection',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Web.json#/resourceDefinitions/sites_hybridConnectionNamespaces_relays',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Web.json#/resourceDefinitions/sites_instances_extensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Web.json#/resourceDefinitions/sites_migrate',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Web.json#/resourceDefinitions/sites_networkConfig',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Web.json#/resourceDefinitions/sites_premieraddons',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Web.json#/resourceDefinitions/sites_privateAccess',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Web.json#/resourceDefinitions/sites_privateEndpointConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Web.json#/resourceDefinitions/sites_publicCertificates',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Web.json#/resourceDefinitions/sites_siteextensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Web.json#/resourceDefinitions/sites_slots',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_config',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_deployments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_domainOwnershipIdentifiers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_extensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_functions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_functions_keys',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_hostNameBindings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_hybridconnection',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_hybridConnectionNamespaces_relays',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_instances_extensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_networkConfig',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_premieraddons',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_privateAccess',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_publicCertificates',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_siteextensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_sourcecontrols',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_virtualNetworkConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_virtualNetworkConnections_gateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Web.json#/resourceDefinitions/sites_sourcecontrols',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Web.json#/resourceDefinitions/sites_virtualNetworkConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Web.json#/resourceDefinitions/sites_virtualNetworkConnections_gateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Web.json#/resourceDefinitions/staticSites',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Web.json#/resourceDefinitions/staticSites_builds_config',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Web.json#/resourceDefinitions/staticSites_config',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-08-01/Microsoft.Web.json#/resourceDefinitions/staticSites_customDomains',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.Web.json#/resourceDefinitions/certificates',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.Web.json#/resourceDefinitions/hostingEnvironments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.Web.json#/resourceDefinitions/hostingEnvironments_multiRolePools',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.Web.json#/resourceDefinitions/hostingEnvironments_workerPools',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.Web.json#/resourceDefinitions/serverfarms',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.Web.json#/resourceDefinitions/serverfarms_virtualNetworkConnections_gateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.Web.json#/resourceDefinitions/serverfarms_virtualNetworkConnections_routes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.Web.json#/resourceDefinitions/sites',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.Web.json#/resourceDefinitions/sites_basicPublishingCredentialsPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.Web.json#/resourceDefinitions/sites_config',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.Web.json#/resourceDefinitions/sites_deployments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.Web.json#/resourceDefinitions/sites_domainOwnershipIdentifiers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.Web.json#/resourceDefinitions/sites_extensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.Web.json#/resourceDefinitions/sites_functions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.Web.json#/resourceDefinitions/sites_functions_keys',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.Web.json#/resourceDefinitions/sites_hostNameBindings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.Web.json#/resourceDefinitions/sites_hybridconnection',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.Web.json#/resourceDefinitions/sites_hybridConnectionNamespaces_relays',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.Web.json#/resourceDefinitions/sites_instances_extensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.Web.json#/resourceDefinitions/sites_migrate',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.Web.json#/resourceDefinitions/sites_networkConfig',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.Web.json#/resourceDefinitions/sites_premieraddons',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.Web.json#/resourceDefinitions/sites_privateAccess',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.Web.json#/resourceDefinitions/sites_privateEndpointConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.Web.json#/resourceDefinitions/sites_publicCertificates',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.Web.json#/resourceDefinitions/sites_siteextensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.Web.json#/resourceDefinitions/sites_slots',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_config',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_deployments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_domainOwnershipIdentifiers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_extensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_functions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_functions_keys',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_hostNameBindings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_hybridconnection',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_hybridConnectionNamespaces_relays',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_instances_extensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_networkConfig',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_premieraddons',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_privateAccess',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_publicCertificates',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_siteextensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_sourcecontrols',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_virtualNetworkConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_virtualNetworkConnections_gateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.Web.json#/resourceDefinitions/sites_sourcecontrols',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.Web.json#/resourceDefinitions/sites_virtualNetworkConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.Web.json#/resourceDefinitions/sites_virtualNetworkConnections_gateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.Web.json#/resourceDefinitions/staticSites',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.Web.json#/resourceDefinitions/staticSites_builds_config',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.Web.json#/resourceDefinitions/staticSites_config',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-06-01/Microsoft.Web.json#/resourceDefinitions/staticSites_customDomains',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.Web.json#/resourceDefinitions/certificates',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.Web.json#/resourceDefinitions/hostingEnvironments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.Web.json#/resourceDefinitions/hostingEnvironments_multiRolePools',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.Web.json#/resourceDefinitions/hostingEnvironments_workerPools',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.Web.json#/resourceDefinitions/serverfarms',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.Web.json#/resourceDefinitions/serverfarms_virtualNetworkConnections_gateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.Web.json#/resourceDefinitions/serverfarms_virtualNetworkConnections_routes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.Web.json#/resourceDefinitions/sites',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.Web.json#/resourceDefinitions/sites_basicPublishingCredentialsPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.Web.json#/resourceDefinitions/sites_config',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.Web.json#/resourceDefinitions/sites_deployments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.Web.json#/resourceDefinitions/sites_domainOwnershipIdentifiers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.Web.json#/resourceDefinitions/sites_extensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.Web.json#/resourceDefinitions/sites_functions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.Web.json#/resourceDefinitions/sites_functions_keys',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.Web.json#/resourceDefinitions/sites_hostNameBindings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.Web.json#/resourceDefinitions/sites_hybridconnection',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.Web.json#/resourceDefinitions/sites_hybridConnectionNamespaces_relays',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.Web.json#/resourceDefinitions/sites_instances_extensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.Web.json#/resourceDefinitions/sites_migrate',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.Web.json#/resourceDefinitions/sites_networkConfig',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.Web.json#/resourceDefinitions/sites_premieraddons',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.Web.json#/resourceDefinitions/sites_privateAccess',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.Web.json#/resourceDefinitions/sites_privateEndpointConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.Web.json#/resourceDefinitions/sites_publicCertificates',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.Web.json#/resourceDefinitions/sites_siteextensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.Web.json#/resourceDefinitions/sites_slots',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_config',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_deployments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_domainOwnershipIdentifiers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_extensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_functions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_functions_keys',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_hostNameBindings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_hybridconnection',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_hybridConnectionNamespaces_relays',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_instances_extensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_networkConfig',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_premieraddons',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_privateAccess',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_publicCertificates',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_siteextensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_sourcecontrols',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_virtualNetworkConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_virtualNetworkConnections_gateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.Web.json#/resourceDefinitions/sites_sourcecontrols',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.Web.json#/resourceDefinitions/sites_virtualNetworkConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.Web.json#/resourceDefinitions/sites_virtualNetworkConnections_gateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.Web.json#/resourceDefinitions/staticSites',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.Web.json#/resourceDefinitions/staticSites_builds_config',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.Web.json#/resourceDefinitions/staticSites_config',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-09-01/Microsoft.Web.json#/resourceDefinitions/staticSites_customDomains',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.Web.json#/resourceDefinitions/certificates',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.Web.json#/resourceDefinitions/hostingEnvironments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.Web.json#/resourceDefinitions/hostingEnvironments_multiRolePools',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.Web.json#/resourceDefinitions/hostingEnvironments_workerPools',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.Web.json#/resourceDefinitions/serverfarms',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.Web.json#/resourceDefinitions/serverfarms_virtualNetworkConnections_gateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.Web.json#/resourceDefinitions/serverfarms_virtualNetworkConnections_routes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.Web.json#/resourceDefinitions/sites',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.Web.json#/resourceDefinitions/sites_basicPublishingCredentialsPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.Web.json#/resourceDefinitions/sites_config',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.Web.json#/resourceDefinitions/sites_deployments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.Web.json#/resourceDefinitions/sites_domainOwnershipIdentifiers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.Web.json#/resourceDefinitions/sites_extensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.Web.json#/resourceDefinitions/sites_functions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.Web.json#/resourceDefinitions/sites_functions_keys',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.Web.json#/resourceDefinitions/sites_hostNameBindings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.Web.json#/resourceDefinitions/sites_hybridconnection',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.Web.json#/resourceDefinitions/sites_hybridConnectionNamespaces_relays',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.Web.json#/resourceDefinitions/sites_instances_extensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.Web.json#/resourceDefinitions/sites_migrate',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.Web.json#/resourceDefinitions/sites_networkConfig',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.Web.json#/resourceDefinitions/sites_premieraddons',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.Web.json#/resourceDefinitions/sites_privateAccess',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.Web.json#/resourceDefinitions/sites_privateEndpointConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.Web.json#/resourceDefinitions/sites_publicCertificates',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.Web.json#/resourceDefinitions/sites_siteextensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.Web.json#/resourceDefinitions/sites_slots',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_config',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_deployments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_domainOwnershipIdentifiers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_extensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_functions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_functions_keys',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_hostNameBindings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_hybridconnection',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_hybridConnectionNamespaces_relays',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_instances_extensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_networkConfig',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_premieraddons',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_privateAccess',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_publicCertificates',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_siteextensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_sourcecontrols',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_virtualNetworkConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_virtualNetworkConnections_gateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.Web.json#/resourceDefinitions/sites_sourcecontrols',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.Web.json#/resourceDefinitions/sites_virtualNetworkConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.Web.json#/resourceDefinitions/sites_virtualNetworkConnections_gateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.Web.json#/resourceDefinitions/staticSites',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.Web.json#/resourceDefinitions/staticSites_builds_config',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.Web.json#/resourceDefinitions/staticSites_config',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-10-01/Microsoft.Web.json#/resourceDefinitions/staticSites_customDomains',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/certificates',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/hostingEnvironments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/hostingEnvironments_configurations',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/hostingEnvironments_multiRolePools',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/hostingEnvironments_privateEndpointConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/hostingEnvironments_workerPools',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/serverfarms',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/serverfarms_virtualNetworkConnections_gateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/serverfarms_virtualNetworkConnections_routes',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/sites',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/sites_basicPublishingCredentialsPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/sites_config',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/sites_deployments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/sites_domainOwnershipIdentifiers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/sites_extensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/sites_functions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/sites_functions_keys',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/sites_hostNameBindings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/sites_hybridconnection',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/sites_hybridConnectionNamespaces_relays',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/sites_instances_extensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/sites_migrate',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/sites_networkConfig',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/sites_premieraddons',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/sites_privateAccess',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/sites_privateEndpointConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/sites_publicCertificates',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/sites_siteextensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/sites_slots',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_basicPublishingCredentialsPolicies',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_config',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_deployments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_domainOwnershipIdentifiers',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_extensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_functions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_functions_keys',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_hostNameBindings',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_hybridconnection',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_hybridConnectionNamespaces_relays',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_instances_extensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_premieraddons',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_privateAccess',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_privateEndpointConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_publicCertificates',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_siteextensions',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_sourcecontrols',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_virtualNetworkConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/sites_slots_virtualNetworkConnections_gateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/sites_sourcecontrols',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/sites_virtualNetworkConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/sites_virtualNetworkConnections_gateways',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/staticSites',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/staticSites_builds_config',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/staticSites_builds_userProvidedFunctionApps',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/staticSites_config',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/staticSites_customDomains',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/staticSites_privateEndpointConnections',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2020-12-01/Microsoft.Web.json#/resourceDefinitions/staticSites_userProvidedFunctionApps',
                },
              ],
            },
          ],
        },
        {
          allOf: [
            {$ref: '#/definitions/resourceBaseExternal'},
            {
              oneOf: [
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-01-01/Sendgrid.Email.json#/resourceDefinitions/accounts',
                },
              ],
            },
          ],
        },
        {
          allOf: [
            {$ref: '#/definitions/ARMResourceBase'},
            {
              oneOf: [
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-01-01/Microsoft.Resources.json#/resourceDefinitions/deployments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2016-02-01/Microsoft.Resources.json#/resourceDefinitions/deployments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2018-05-01/Microsoft.Resources.json#/resourceDefinitions/deployments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2019-05-01/Microsoft.Resources.json#/resourceDefinitions/deployments',
                },
                {
                  $ref: 'https://schema.management.azure.com/schemas/2015-01-01/Microsoft.Resources.json#/resourceDefinitions/links',
                },
              ],
            },
          ],
        },
      ],
    },
    resourcesWithSymbolicNames: {
      type: 'object',
      description: 'Resources with symbolic names',
      additionalProperties: {$ref: '#/definitions/resource'},
    },
    resourcesWithoutSymbolicNames: {
      type: 'array',
      description: 'Resources without symbolic names',
      items: {$ref: '#/definitions/resource'},
    },
  },
}
