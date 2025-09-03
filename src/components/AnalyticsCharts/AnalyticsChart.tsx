'use client';

import dynamic from 'next/dynamic';
import { Box } from '@chakra-ui/react';
import { PageViewsData } from '@/types';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface AnalyticsChartProps {
  data: PageViewsData[];
  dataName: string;
}

export function AnalyticsChart({ data, dataName }: AnalyticsChartProps) {
  const chartData = {
    series: [
      {
        name: dataName,
        data: data.map((item) => item.pageViews),
      },
    ],
    options: {
      chart: {
        type: 'line' as const,
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: true,
        },
      },
      responsive: [
        {
          breakpoint: 768,
          options: {
            chart: {
              height: 250,
            },
            xaxis: {
              labels: {
                rotate: -45,
                rotateAlways: true,
                style: {
                  fontSize: '10px',
                },
              },
            },
          },
        },
        {
          breakpoint: 480,
          options: {
            chart: {
              height: 200,
            },
            xaxis: {
              labels: {
                rotate: -45,
                rotateAlways: true,
                style: {
                  fontSize: '8px',
                },
              },
            },
          },
        },
      ],
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth' as const,
        colors: ['#9373FF'],
        width: 3,
      },
      xaxis: {
        categories: data.map((item) => new Date(item.date).toLocaleDateString()),
        labels: {
          rotate: -45,
          rotateAlways: false,
          style: {
            fontSize: '12px',
          },
        },
      },
      tooltip: {
        y: {
          formatter: (value: number) => `${value} views`,
        },
      },
    },
  };

  return (
    <Box 
      p={0} 
      bg="white" 
      borderRadius="md" 
      boxShadow="sm" 
      w="full" 
      overflow="hidden"
    >
      <Chart
        options={chartData.options}
        series={chartData.series}
        type="line"
        height={350}
        width="100%"
      />
    </Box>
  );
} 