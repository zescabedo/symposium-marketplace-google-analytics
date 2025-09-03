"use client";
import { useState, useEffect, useCallback } from "react";
import {
    useToast,
    Card,
    CardBody,
    Text,
    CardHeader,
} from "@chakra-ui/react";
import { AnalyticsChart } from "@/components/AnalyticsCharts/AnalyticsChart";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PageViewsData, ApiResponse, ApiError, AnalyticsChartProps } from "@/types";

export default function PageViews({ propertyId, route, initialDays = "14" }: AnalyticsChartProps) {
    const [data, setData] = useState<PageViewsData[]>([]);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    const fetchData = useCallback(async () => {
        if (!route) {
            toast({
                title: "Error",
                description: "Please enter a URL path after the domain name starting with a /",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        if (propertyId === "-1") {
            toast({
                title: "Error",
                description: "Please select a site",
                status: "error",
            });
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`/api/analytics/PageViews?url=${encodeURIComponent(route)}&days=${initialDays}&property=${propertyId}`);
            
            if (!response.ok) {
                const errorData: ApiError = await response.json();
                throw new Error(errorData.details ?? errorData.error ?? "Failed to fetch data");
            }
            
            const result: ApiResponse<PageViewsData[]> = await response.json();
            setData(result.data);
        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : "Failed to fetch analytics data";
            toast({
                title: "Error",
                description: errorMessage,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    }, [route, propertyId, initialDays, toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <>
        {loading
            ? <LoadingSpinner />
            : data.length > 0 && (
                <Card variant={'outline'} w="full">
                    <CardHeader>
                        <Text fontSize={{ base: "sm", md: "md" }} fontWeight="medium">
                            Page views for the past {initialDays} days on page {route}
                        </Text>
                    </CardHeader>
                    <CardBody>
                        <AnalyticsChart data={data} dataName="Page Views" />
                    </CardBody>
                </Card>
            )
        }
        </>
    )
}