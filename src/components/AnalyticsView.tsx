"use client";
import { useState } from "react";
import {
  Stack,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Flex,
  Text,
  HStack,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  SimpleGrid,
} from "@chakra-ui/react";
import PageViews from "@/components/AnalyticsCharts/PageViews";
import ActiveUsers from "@/components/AnalyticsCharts/ActiveUsers";
import { GaSiteInfo } from "@/types";

interface AnalyticsViewProps {
  gaSiteInfo: GaSiteInfo | undefined;
}

export default function AnalyticsView({ gaSiteInfo }: AnalyticsViewProps) {
  const [days, setDays] = useState("14");

  return (
    <Stack gap="4">
      <Card variant={"outline"}>
        <CardHeader>
          <Heading size="sm">Site Details</Heading> 
        </CardHeader>
        <CardBody>
          <Flex 
            gap={4} 
            direction={{ base: "column", md: "row" }}
            align={{ base: "stretch", md: "flex-start" }}
          >
            <Stack spacing={2} flex="1">                 
              <HStack flexWrap="wrap" spacing={{ base: 1, sm: 2 }}>
                <Text fontWeight="bold" fontSize={{ base: "sm", md: "md" }}>Site Name:</Text>
                <Text fontSize={{ base: "sm", md: "md" }} wordBreak="break-word">{gaSiteInfo?.name}</Text>
              </HStack>
              <HStack flexWrap="wrap" spacing={{ base: 1, sm: 2 }}>
                <Text fontWeight="bold" fontSize={{ base: "sm", md: "md" }}>Site GA Property ID:</Text>
                <Text fontSize={{ base: "sm", md: "md" }} wordBreak="break-all">{gaSiteInfo?.propertyId}</Text>
              </HStack>
              <HStack flexWrap="wrap" spacing={{ base: 1, sm: 2 }}>
                <Text fontWeight="bold" fontSize={{ base: "sm", md: "md" }}>Current Route:</Text>
                <Text fontSize={{ base: "sm", md: "md" }} wordBreak="break-word">{gaSiteInfo?.path}</Text>
              </HStack>
            </Stack>

            <Stack spacing={2} minW={{ base: "auto", md: "200px" }}>
              <HStack>
                <FormControl>
                    <Input value={gaSiteInfo?.propertyId ?? ''} readOnly={true} hidden={true}/>
                    <Input value={gaSiteInfo?.path ?? ''} readOnly={true} hidden={true}/>
                    <FormLabel fontSize={{ base: "sm", md: "md" }}>Number of Days</FormLabel>
                    <NumberInput value={days} onChange={(value) => setDays(value)} min={1} max={90} w={{ base: "full", md: 20 }}>
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                </FormControl>
              </HStack>
            </Stack>
          </Flex>
        </CardBody>
      </Card>
      
      {gaSiteInfo?.propertyId && gaSiteInfo?.path && (
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
          <PageViews propertyId={gaSiteInfo?.propertyId} route={gaSiteInfo?.path} initialDays={days} />
          <ActiveUsers propertyId={gaSiteInfo?.propertyId} route={gaSiteInfo?.path} initialDays={days} />
        </SimpleGrid>              
      )}
    </Stack>
  );
} 