import { ClientSDK } from "@sitecore-marketplace-sdk/client";
import { getContextId } from "./client";

interface ModuleInstallationStatus {
    isInstalled: boolean;
}

interface Item {
    itemId: string;
    name: string;
    path: string;
}

interface QueryItemData {
    item: Item;
}

interface QueryItemResponse {
    data: {
        data: QueryItemData;
    };
}

interface CreateItemResponse {
    data: {
        data: {
            createItem: {
                item: Item;
            };
        };
    };
}

interface CreateTemplateFolderResponse {
    data: {
        data: {
            createItemTemplateFolder: {
                item: {
                    name: string;
                    itemId: string;
                };
            };
        };
    };
}

export interface SiteInfo {
    id: string;
    name: string;
    propertyId: string;
    path: string;
}

interface SiteData {
    id?: string | null;
    name?: string | null;
    properties?: {
        rootPath?: string;
    };
}

interface GetPropertyFieldValue {
    value: string;
}

interface GetPropertyIdItem {
    name: string;
    field: GetPropertyFieldValue;
}

interface GetPropertyIdRData {
    item: GetPropertyIdItem;
}

interface GetPropertyIdResponse {
    data: {
        data: GetPropertyIdRData;
    }
}

export async function getModuleInstallationStatus(client: ClientSDK | null): Promise<ModuleInstallationStatus> {
    const invalidSiteInfo: ModuleInstallationStatus = { isInstalled: false };
    
    const contextId = await getContextId(client);
    if (!contextId) {
        return invalidSiteInfo;
    }

    const response = await client?.mutate(
        "xmc.authoring.graphql",
        {
            params: {
                query: {
                    sitecoreContextId: contextId,
                },
                body: {
                    query: `{
                        item(
                            where: {
                                database: "master",
                                path: "/sitecore/templates/Modules/GoogleAnalytics/GoogleAnalyticsSiteSettings"
                            }
                        ){
                            itemId,
                            name,
                            path
                        }
                    }`
                }
            }
        }
    ) as unknown as QueryItemResponse;
    
    return {
        isInstalled: response?.data?.data?.item?.path ? true : false,
    };
}

export async function createGoogleAnalyticsTemplates(client: ClientSDK | null): Promise<boolean> {
    const contextId = await getContextId(client);
    if (!contextId) {
        return false;
    }

    try {
        // Create Google Analytics templates folder
        const gaFolderResponse = await client?.mutate(
            "xmc.authoring.graphql",
            {
                params: {
                    query: {
                        sitecoreContextId: contextId,
                    },
                    body: {
                        query: `mutation {
                            createItemTemplateFolder(
                                input: {
                                    name: "GoogleAnalytics",
                                    parent: "{E6904C9A-3ACE-4B53-B465-4C05C6B1F1CC}"
                                }
                            ) {
                                item {
                                    name,
                                    itemId
                                }
                            }
                        }`
                    }
                }
            }
        ) as unknown as CreateTemplateFolderResponse;

        const gaFolderId = gaFolderResponse?.data?.data?.createItemTemplateFolder?.item?.itemId;
        if (!gaFolderId) {
            console.error("Failed to create Google Analytics templates folder");
            return false;
        }

        // Create Google Analytics template
        const gaTemplateResponse = await client?.mutate(
            "xmc.authoring.graphql",
            {
                params: {
                    query: {
                        sitecoreContextId: contextId,
                    },
                    body: {
                        query: `mutation {
                            createItemTemplate(
                                input: {
                                    name: "GoogleAnalyticsSiteSettings",
                                    parent: "${gaFolderId}",
                                    icon: "Office/32x32/chart_line.png",
                                    sections: {
                                        name: "Google Settings",
                                        fields: [
                                            {
                                                name: "gTag",
                                                type: "Single-Line Text",
                                            },
                                            {
                                                name: "PropertyID",
                                                type: "Single-Line Text",
                                            },                                                    
                                        ]
                                    }
                                }
                            ) {
                                itemTemplate  {
                                    name,
                                    templateId
                                }
                            }
                        }`
                    }
                }
            }
        );

        console.log("Created Google Analytics templates folder:", gaFolderId, gaTemplateResponse);
        return true;
    } catch (error) {
        console.error("Failed to create Google Analytics templates:", error);
        return false;
    }
}

export async function getSitesInformation(client: ClientSDK | null): Promise<SiteInfo[]> {
    const contextId = await getContextId(client);
    if (!contextId) {
        return [];
    }

    try {
        const sites = await client?.query(
            "xmc.xmapp.listSites",
            {
                params: {
                    query: {
                        sitecoreContextId: contextId,
                    },
                },
            }
        );

        const siteInfos = await Promise.all(
            sites?.data?.data?.map(async (site: unknown) => {
                const siteData = site as SiteData;
                return {
                    name: siteData.name ?? '',
                    propertyId: await getGooglePropertyId(client, siteData.properties?.rootPath ?? ''),
                    path: siteData.properties?.rootPath ?? '',
                    id: siteData.id ?? '',
                };
            }) ?? []
        );
        return siteInfos;

    } catch (error) {
        console.error("Failed to retrieve Sites information:", error);
        return [];
    }  
}

async function getGooglePropertyId(client: ClientSDK | null, path: string): Promise<string> {
    const contextId = await getContextId(client);
    if (!contextId) {
        return "";
    }

    const response = await client?.mutate(
        "xmc.authoring.graphql",
        {
            params: {
                query: {
                    sitecoreContextId: contextId,
                },
                body: {
                    query: `{
                        item(
                            where: {
                                database: "master",
                                path: "${path}/Settings/Google Analytics"
                            }
                        ){
                            name,
                            field(name:"PropertyId")
                            {
                                value
                            }
                        }
                    }`
                }
            }
        }
    ) as unknown as GetPropertyIdResponse;
    
    console.log("Path:", path);
    console.log("Response:", response);

    return response?.data?.data?.item?.field === null 
        ? ""
        : response?.data?.data?.item?.field?.value ?? "-1";
}

export async function updateSitePropertyId(client: ClientSDK | null, site: SiteInfo): Promise<boolean> {
    const contextId = await getContextId(client);
    if (!contextId) {
        return false;
    }

    try {
        const gaSiteSettingsItemResponse = await client?.mutate(
            "xmc.authoring.graphql",
            {
                params: {
                    query: {
                        sitecoreContextId: contextId,
                    },
                    body: {
                        query: `mutation {
                            updateItem(
                                input: {
                                    path: "${site.path}/Settings/Google Analytics",
                                    fields: [
                                        {
                                            name: "PropertyID",
                                            value: "${site.propertyId}"
                                        }
                                    ]
                                }
                            ) {
                                item {
                                    itemId,
                                    name,
                                    path
                                }
                            }
                        }`
                    }
                }
            }
        ) as unknown as CreateItemResponse;
        
        console.log("Updated site property ID:", gaSiteSettingsItemResponse);
        return true;

    } catch (error) {
        console.error("Failed to update site property ID:", error);
        return false;
    }
}

export async function configureSite(client: ClientSDK | null, site: SiteInfo): Promise<boolean> {
    const contextId = await getContextId(client);
    if (!contextId) {
        return false;
    }

    try {
        // Get site settings folder
        const siteSettingsFolderResponse = await client?.mutate(
            "xmc.authoring.graphql",
            {
                params: {
                    query: {
                        sitecoreContextId: contextId,
                    },
                    body: {
                        query: `query {
                            item(
                                where: {
                                    database: "master",
                                    path: "${site.path}/Settings"
                                }
                            ) {
                                itemId
                                name
                                path
                            }
                        }`
                    }
                }
            }
        ) as unknown as QueryItemResponse;

        const siteSettingsFolderId = siteSettingsFolderResponse?.data?.data?.item?.itemId;
        if (!siteSettingsFolderId) {
            console.error("Failed to get site settings folder");
            return false;
        }
        console.log("Retrieved settings folder:", siteSettingsFolderId);

        // Get Google Analytics template
        const gaSettingsTemplateResponse = await client?.mutate(
            "xmc.authoring.graphql",
            {
                params: {
                    query: {
                        sitecoreContextId: contextId,
                    },
                    body: {
                        query: `{
                            item(
                                where: {
                                    database: "master",
                                    path: "/sitecore/templates/Modules/GoogleAnalytics/GoogleAnalyticsSiteSettings"
                                }
                            ){
                                itemId,
                                name,
                                path
                            }
                        }`
                    }
                }
            }
        ) as unknown as QueryItemResponse;

        const gaSettingsTemplateId = gaSettingsTemplateResponse?.data?.data?.item?.itemId;
        if (!gaSettingsTemplateId) {
            console.error("Failed to get Google Analytics settings template");
            return false;
        }
        console.log("Google Analytics settings template:", gaSettingsTemplateId);

        // Create Google Analytics site settings item
        const gaSiteSettingsItemResponse = await client?.mutate(
            "xmc.authoring.graphql",
            {
                params: {
                    query: {
                        sitecoreContextId: contextId,
                    },
                    body: {
                        query: `mutation {
                            createItem(
                                input: {
                                    name: "Google Analytics",
                                    templateId: "${gaSettingsTemplateId}"
                                    parent: "${siteSettingsFolderId}",
                                    language: "en",
                                    database: "master"
                                }
                            ) {
                                item {
                                    itemId,
                                    name,
                                    path
                                }
                            }
                        }`
                    }
                }
            }
        ) as unknown as CreateItemResponse;

        const gaItemId = gaSiteSettingsItemResponse?.data?.data?.createItem?.item?.itemId;
        console.log(gaSiteSettingsItemResponse);
        if (!gaItemId) {
            console.error("Failed to create Google Analytics item");
            return false;
        }

        console.log("Created Google Analytics settings item:", gaSiteSettingsItemResponse);
        return true;
    } catch (error) {
        console.error("Failed to configure site:", error);
        return false;
    }
}