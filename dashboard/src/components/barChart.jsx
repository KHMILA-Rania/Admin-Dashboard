import { useEffect, useState } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { useTheme } from '@mui/material';
import { tokens } from '../theme';
import axios from 'axios';

const BarChart = ({ isDashboard = false }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:3000/complaint/complaints/by-partner');
                const transformedData = response.data.map(item => ({
                    partner: item.partnerName,
                    complaints: item.count,
                }));
                setData(transformedData);
            } catch (error) {
                console.error('Error fetching complaints by partner:', error);
            }
        };

        fetchData();
    }, []);

    // Define an array of colors for alternating bars
    const barColors = ['#1baab8', '#4faf89', '#2B6CB0', '#71510c'];

    return (
        <ResponsiveBar
            data={data}
            keys={['complaints']}
            indexBy="partner"
            margin={{ top: 50, right: 50, bottom: 50, left: 60 }}
            padding={0.3}
            valueScale={{ type: 'linear' }}
            indexScale={{ type: 'band', round: true }}
            colors={(bar) => barColors[bar.index % barColors.length]}  // Loop through colors
            theme={{
                axis: {
                    domain: { line: { stroke: colors.grey[100] } },
                    legend: { text: { fill: colors.grey[100] } },
                    ticks: {
                        line: { stroke: colors.grey[100], strokeWidth: 1 },
                        text: { fill: colors.grey[100] },
                    },
                },
                legends: { text: { fill: colors.grey[100] } },
                tooltip: {
                    container: {
                        background: colors.primary[500],
                        color: '#fff',
                        fontSize: 12,
                    },
                },
            }}
            borderColor={{
                from: 'color',
                modifiers: [['darker', 1.6]],
            }}
            axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: isDashboard ? undefined : 'Partner',
                legendPosition: 'middle',
                legendOffset: 32,
            }}
            axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: isDashboard ? undefined : 'Number of Complaints',
                legendPosition: 'middle',
                legendOffset: -40,
            }}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor={{
                from: 'color',
                modifiers: [['darker', 1.6]],
            }}
            legends={[]}  // No legend (only one metric)
            tooltip={({ id, value, indexValue }) => (
                <div style={{ padding: '6px 12px', background: colors.primary[500], color: '#fff', borderRadius: '4px' }}>
                    <strong>{indexValue}</strong>: {value} complaints
                </div>
            )}
            role="application"
            ariaLabel="Complaints per partner bar chart"
            barAriaLabel={e => `${e.indexValue}: ${e.formattedValue} complaints`}
        />
    );
};

export default BarChart;
