"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Container,
  Heading,
  Flex,
  Box,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { PagesContext } from "@sitecore-marketplace-sdk/client";
import { SettingsIcon, ArrowBackIcon } from "@chakra-ui/icons";
import { useMarketplaceClient } from "@/utils/hooks/useMarketplaceClient";
import { bindToPageContext, processPageContext } from "@/utils/marketplace";
import { getModuleInstallationStatus } from "@/utils/moduleInstallation";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import SetupView from "@/components/SetupView";
import AnalyticsView from "@/components/AnalyticsView";
import AnalyticsNotConfigured from "@/components/AnalyticsNotConfigured";
import { GaSiteInfo } from "@/types";

export default function Home() {
  const { client, error, isInitialized } = useMarketplaceClient();
  const [loading, setLoading] = useState(true);
  const [gaSiteInfo, setGaSiteInfo] = useState<GaSiteInfo>();
  const [showSetup, setShowSetup] = useState(false);
  const [moduleInstalled, setModuleInstalled] = useState<boolean | null>(null);

  const prevShowSetupRef = useRef<boolean>(false);

  const loadMarketplaceData = useCallback(async () => {
    async function handlePageContextChange(res: PagesContext) {
      const gaSiteInfo = await processPageContext(client, res);
      setGaSiteInfo(gaSiteInfo);
    }  
    
    if (!error && isInitialized && client) {
      setLoading(true);
      
      const installationStatus = await getModuleInstallationStatus(client);
      setModuleInstalled(installationStatus.isInstalled);

      if (installationStatus.isInstalled) {
        await bindToPageContext(client, handlePageContextChange);
      }
      setLoading(false);
    } else if (error) {
      console.error("Error initializing Marketplace client:", error);
    }
  }, [isInitialized, client, error]);

  // Initial data loading on component mount
  useEffect(() => {
    loadMarketplaceData();
  }, [loadMarketplaceData]);


  // Reload data when returning from setup view
  useEffect(() => {
    // Check if we're returning from setup (showSetup changed from true to false)
    if (prevShowSetupRef.current === true && showSetup === false) {
      console.log("Returning from setup, reloading data...");
      loadMarketplaceData();
    }
    prevShowSetupRef.current = showSetup;
  }, [showSetup, loadMarketplaceData]);

  const handleSettingsClick = () => {
    setShowSetup(!showSetup);
  }

  // Show loading spinner
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Container maxW={{ base: "container.sm", md: "container.md", lg: "container.lg" }} py={8} px={{ base: 4, md: 6 }}>
      <Flex 
        alignItems="center" 
        justifyContent="space-between" 
        py={4}
        flexWrap={{ base: "wrap", sm: "nowrap" }}
        gap={{ base: 2, sm: 0 }}
      >
        <Heading as="h1" size={{ base: "sm", md: "md" }} textAlign={{ base: "center", sm: "left" }} flex={{ base: "1 1 100%", sm: "0 1 auto" }}>
          Google Analytics
        </Heading>
        <Box flexShrink={0}>
          <Tooltip label={showSetup ? "Back to Analytics" : "Setup & Configuration"}>
            <IconButton
              onClick={handleSettingsClick}
              icon={showSetup ? <ArrowBackIcon /> : <SettingsIcon />}
              aria-label={showSetup ? "Back to Analytics" : "Setup & Configuration"}
              variant="ghost"
              size={{ base: "sm", md: "md" }}
            />
          </Tooltip>
        </Box>
      </Flex>

      {showSetup ? (
        <SetupView client={client} />
      ) : !moduleInstalled || gaSiteInfo?.propertyId === "" ? (
        <AnalyticsNotConfigured />
      ) : (
        <AnalyticsView gaSiteInfo={gaSiteInfo} />
      )}
    </Container>
  );
}
