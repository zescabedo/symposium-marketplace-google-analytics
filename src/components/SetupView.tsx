"use client";
import { useState, useEffect, useCallback } from "react";
import {
  VStack,
  Heading,
  Text,
  Box,
  Button,
  Spinner,
  Image,
  Divider,
  Input,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from "@chakra-ui/react";
import { ClientSDK } from "@sitecore-marketplace-sdk/client";
import { createGoogleAnalyticsTemplates, getModuleInstallationStatus, getSitesInformation, SiteInfo, configureSite, updateSitePropertyId } from "@/utils/moduleInstallation";

interface SetupViewProps {
  client: ClientSDK | null;
}

export default function SetupView({ client }: SetupViewProps) {
  const [isModuleInstalled, setIsModuleInstalled] = useState<boolean | null>(null);
  const [sites, setSites] = useState<SiteInfo[]>([]);
  const [isLoadingSites, setIsLoadingSites] = useState<boolean>(true);
  const [configuringSiteId, setConfiguringSiteId] = useState<string | null>(null);
  const [savingSiteId, setSavingSiteId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<{[siteId: string]: 'success' | 'error' | null}>({});
  const [isInstallingModule, setIsInstallingModule] = useState<boolean>(false);

  useEffect(() => {
    const checkModuleStatus = async () => {
      try {
        const status = await getModuleInstallationStatus(client);
        setIsModuleInstalled(status.isInstalled);
      } catch (error) {
        console.error('Error checking module status:', error);
        setIsModuleInstalled(false);
      }
    };
    checkModuleStatus();
  }, [client]);

  const loadSites = useCallback(async () => {
    setIsLoadingSites(true);
    try {
      const sitesData = await getSitesInformation(client);
      
      // Using mock data for now
      setTimeout(() => {
        setSites(sitesData);
        setIsLoadingSites(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading sites:', error);
      setIsLoadingSites(false);
    }
  }, [client]);

  useEffect(() => {
    // Load sites when module is installed
    if (isModuleInstalled) {
      loadSites();
    }
  }, [isModuleInstalled, loadSites]);

  const handleInstallModule = async () => {
    setIsInstallingModule(true);
    try {
      console.log('Installing module...');
      const status = await createGoogleAnalyticsTemplates(client);     
      setIsModuleInstalled(status);
    } catch (error) {
      console.error('Error installing module:', error);
      alert('Failed to install module. Please try again.');
    } finally {
      setIsInstallingModule(false);
    }
  };

  const handlePropertyIdChange = (siteId: string, propertyId: string) => {
    setSites(sites.map(site => 
      site.id === siteId 
        ? { ...site, propertyId }
        : site
    ));
  };

  const handleSaveSite = async (site: SiteInfo) => {
    setSavingSiteId(site.id);
    setSaveStatus(prev => ({ ...prev, [site.id]: null }));
    
    try {
      console.log('Saving site configuration:', site);
      const success = await updateSitePropertyId(client, site);
      setSaveStatus(prev => ({ ...prev, [site.id]: success ? 'success' : 'error' }));
    } catch (error) {
      console.error('Error saving site configuration:', error);
      setSaveStatus(prev => ({ ...prev, [site.id]: 'error' }));
    } finally {
      setSavingSiteId(null);
      // Clear status after 3 seconds
      setTimeout(() => {
        setSaveStatus(prev => ({ ...prev, [site.id]: null }));
      }, 3000);
    }
  };

  const handleConfigureSite = async (site: SiteInfo) => {
    setConfiguringSiteId(site.id);
    try {
      console.log('Configuring site:', site);
      await configureSite(client, site);
      
      // Update the site state to show it's now configured
      setSites(sites.map(s => 
        s.id === site.id 
          ? { ...s, propertyId: '' } // Change from "-1" to empty string to show input field
          : s
      ));
    } catch (error) {
      console.error('Error configuring site:', error);
      alert(`Failed to configure ${site.name}`);
    } finally {
      setConfiguringSiteId(null);
    }
  };

  return (
    <VStack spacing={8} align="stretch">
      <Flex 
        gap="4" 
        alignItems="center" 
        direction={{ base: "column", sm: "row" }}
        textAlign={{ base: "center", sm: "left" }}
      >
        <Image 
          src="/google-analytics-logo.png"
          alt="Google Analytics Logo"
          width="50px"
          height="50px"
          objectFit="contain"
          flexShrink={0}
        />
        <Heading size={{ base: "md", md: "lg" }}>Google Analytics - Setup</Heading>            
      </Flex>

      {/* Module Installation Section */}
      <Box>
        <Heading size={{ base: "sm", md: "md" }} mb={4}>Module Installation</Heading>
        <Text mb={4} fontSize={{ base: "sm", md: "md" }}>
          Install the templates for the Google Analytics module so it&apos;s ready to use.
        </Text>
        
        {isModuleInstalled === null ? (
          <Box mb={4} display="flex" alignItems="center">
            <Spinner size="sm" mr={2} />
            <Text fontSize={{ base: "sm", md: "md" }}>Checking module status...</Text>
          </Box>
        ) : isModuleInstalled ? (
          <Text color="green.500" fontWeight="bold" mb={4} fontSize={{ base: "sm", md: "md" }}>
            ✓ Module is installed
          </Text>
        ) : (
          <Button 
            colorScheme="blue" 
            onClick={handleInstallModule} 
            mb={4}
            size={{ base: "sm", md: "md" }}
            isLoading={isInstallingModule}
            loadingText="Installing"
            isDisabled={isInstallingModule}
          >
            Install Module
          </Button>
        )}
        
        <Divider mb={4} />
      </Box>     

      {isModuleInstalled && (
        <Box>
          <Heading size={{ base: "sm", md: "md" }} mb={4}>XMC Sites Configuration</Heading>
          <Text mb={4} fontSize={{ base: "sm", md: "md" }}>
            Configure the Google Analytics Property ID for each of your XMC sites below.
          </Text>
          
          {isLoadingSites ? (
            <Box display="flex" alignItems="center" mb={4}>
              <Spinner size="sm" mr={2} />
              <Text fontSize={{ base: "sm", md: "md" }}>Loading sites...</Text>
            </Box>
          ) : sites.length > 0 ? (
            <TableContainer>
              <Table variant="simple" size={{ base: "sm", md: "md" }}>
                <Thead>
                  <Tr>
                    <Th>Site Name</Th>
                    <Th>Property ID</Th>
                    <Th>Action</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {sites.map((site) => (
                    <Tr key={site.id}>
                      <Td fontWeight="medium">{site.name}</Td>
                      <Td>
                        {site.propertyId === "-1" ? (
                          <Text color="gray.500" fontSize="sm">
                            Not configured
                          </Text>
                        ) : (
                          <Input
                            placeholder="XXXXXXXXXX"
                            value={site.propertyId}
                            onChange={(e) => handlePropertyIdChange(site.id, e.target.value)}
                            size="sm"
                            maxWidth="200px"
                          />
                        )}
                      </Td>
                      <Td>
                        {site.propertyId === "-1" ? (
                          <Button
                            colorScheme="blue"
                            size="sm"
                            variant="outline"
                            onClick={() => handleConfigureSite(site)}
                            isLoading={configuringSiteId === site.id}
                            loadingText="Configuring"
                          >
                            Configure
                          </Button>
                        ) : (
                          <Flex alignItems="center" gap={2}>
                            <Button
                              colorScheme={saveStatus[site.id] === 'success' ? 'green' : saveStatus[site.id] === 'error' ? 'red' : 'blue'}
                              size="sm"
                              onClick={() => handleSaveSite(site)}
                              isDisabled={!site.propertyId.trim()}
                              isLoading={savingSiteId === site.id}
                              loadingText="Updating"
                            >
                              Update
                            </Button>
                            {saveStatus[site.id] === 'success' && (
                              <Text color="green.500" fontSize="sm" fontWeight="medium">
                                ✓ Saved
                              </Text>
                            )}
                            {saveStatus[site.id] === 'error' && (
                              <Text color="red.500" fontSize="sm" fontWeight="medium">
                                ✗ Failed
                              </Text>
                            )}
                          </Flex>
                        )}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          ) : (
            <Text color="gray.500" textAlign="center" py={4} fontSize={{ base: "sm", md: "md" }}>
              No sites found.
            </Text>
          )}
          
          <Divider mb={4} />
        </Box>
      )}
    </VStack>
  );
} 