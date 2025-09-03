import { ClientSDK, PagesContext } from "@sitecore-marketplace-sdk/client";
import { GaSiteInfo, GqlResponse, } from "@/types";
import { getContextId } from "./client";

export async function bindToPageContext(client: ClientSDK | null, handlePageContextChange: (res: PagesContext) => void): Promise<GaSiteInfo> {
    const invalidSiteInfo: GaSiteInfo = { id: "-1", name: "", propertyId: "", path: "" };

    try {
        const contextId = await getContextId(client);
        if (!contextId) {
            return invalidSiteInfo;
        }
        
        await client?.query(
            "pages.context", {
                subscribe: true,
                onSuccess: (res: PagesContext) => {
                    handlePageContextChange(res);
                },
            }
        );
        
        return invalidSiteInfo;
    } catch (error) {
        console.error("Client initialization failed:", error);
        return invalidSiteInfo;
    }
}

export async function processPageContext(client: ClientSDK | null, pageContext: PagesContext): Promise<GaSiteInfo> {
    const invalidSiteInfo: GaSiteInfo = { id: "-1", name: "", propertyId: "", path: "" };
    
    try {
        const contextId = await getContextId(client);
        if (!contextId) {
            return invalidSiteInfo;
        }

        const application = await client?.query(
            "application.context"
        );  

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
        ) as unknown as GqlResponse;

        const googleAnalyticsTemplateId = response?.data?.data?.item?.itemId;
        if (googleAnalyticsTemplateId === null) {
            console.error("Google Analytics template ID is null");
            return invalidSiteInfo;
        }

        const PropertyId = await client?.mutate(
            "xmc.preview.graphql",
            {
                params: {
                    query: {
                        sitecoreContextId: `${application?.data?.resources?.[0]?.context?.preview}`,
                    },
                    body: {
                        query: `{
                                    item(path:"/sitecore/content/${pageContext?.siteInfo?.collectionId}/${pageContext?.siteInfo?.name}/Settings", language:"${pageContext?.pageInfo?.language}") {
                                        id,
                                        name,
                                        children(includeTemplateIDs:"${googleAnalyticsTemplateId}") {
                                            results {
                                                id,
                                                name,
                                                field(name: "PropertyID") {
                                                    name,
                                                    value
                                                }
                                            }
                                        }
                                    }
                                }`
                    }
                },
            }
        ) as unknown as GqlResponse;
       
        return {
            id: pageContext?.siteInfo?.id ?? "",
            name: pageContext?.siteInfo?.name ?? "",
            propertyId: PropertyId?.data?.data?.item?.children?.results[0]?.field?.value ?? "",
            path: pageContext?.pageInfo?.route ?? ""
        };
    } catch (error) {
        console.error("Client initialization failed:", error);
        return invalidSiteInfo;
    }
}

export async function getActiveSiteDetails(client: ClientSDK | null): Promise<string[]> {

    try {       
        const collections = await client?.query(
            "pages.context"
        );
        console.log(collections);

        const siteInfo = collections?.data?.siteInfo;
        return siteInfo?.id && siteInfo?.name ? [siteInfo.id, siteInfo.name, "1234"] : [];
    } catch (error) {
        console.error("Client initialization failed:", error);
        return [];
    }
}
