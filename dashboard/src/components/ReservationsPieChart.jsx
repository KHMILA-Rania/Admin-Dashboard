import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const ReservationsPieChart = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Color palette for the pie chart
    const colors = [
        '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1',
        '#d084d0', '#ffb347', '#87ceeb', '#dda0dd', '#98fb98',
        '#f0e68c', '#ff6347', '#40e0d0', '#ee82ee', '#90ee90'
    ];

    useEffect(() => {
        fetchReservationsData();
    }, []);

    const fetchReservationsData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Replace this URL with your actual API endpoint
            const response = await fetch('http://localhost:3000/reservation/all'); // Update this with your actual endpoint
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            // Validate that we have reservations data
            if (!result.reservations || !Array.isArray(result.reservations)) {
                throw new Error('Invalid data format: reservations array not found');
            }

            if (result.reservations.length === 0) {
                setData([]);
                return;
            }
            
            // Process the data to count reservations by station
            const stationCounts = {};
            
            result.reservations.forEach(reservation => {
                // Check if stationId exists and has a name
                if (reservation.stationId && reservation.stationId.name) {
                    const stationName = reservation.stationId.name;
                    if (stationCounts[stationName]) {
                        stationCounts[stationName]++;
                    } else {
                        stationCounts[stationName] = 1;
                    }
                } else {
                    // Handle cases where station info is missing
                    const unknownKey = 'Unknown Station';
                    if (stationCounts[unknownKey]) {
                        stationCounts[unknownKey]++;
                    } else {
                        stationCounts[unknownKey] = 1;
                    }
                }
            });

            // Convert to format expected by recharts
            const chartData = Object.entries(stationCounts).map(([name, value]) => ({
                name,
                value,
                percentage: ((value / result.reservations.length) * 100).toFixed(1)
            }));

            setData(chartData);
            setError(null);
        } catch (err) {
            console.error('Error fetching reservations:', err);
            setError(err.message);
            // Mock data for demonstration
            setData([
                { name: 'Tunis Charging', value: 15, percentage: '45.5' },
                { name: 'Sfax Station', value: 8, percentage: '24.2' },
                { name: 'Sousse Hub', value: 6, percentage: '18.2' },
                { name: 'Bizerte Point', value: 4, percentage: '12.1' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
                    <p className="text-gray-800 font-semibold">{`${payload[0].name}`}</p>
                    <p className="text-blue-600">{`Reservations: ${payload[0].value}`}</p>
                    <p className="text-green-600">{`Percentage: ${payload[0].payload.percentage}%`}</p>
                </div>
            );
        }
        return null;
    };

    const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        if (percent > 0.05) { // Only show label if slice is larger than 5%
            return (
                <text 
                    x={x} 
                    y={y} 
                    fill="white" 
                    textAnchor={x > cx ? 'start' : 'end'} 
                    dominantBaseline="central"
                    fontSize="12"
                    fontWeight="bold"
                >
                    {`${(percent * 100).toFixed(1)}%`}
                </text>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className="w-full h-96 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading reservations data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-white rounded-lg shadow-lg p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Reservations by Station</h2>
                <p className="text-gray-600">Distribution of reservations across charging stations</p>
                {error && (
                    <div className="mt-2 p-3 bg-yellow-100 border border-yellow-400 rounded">
                        <p className="text-yellow-700 text-sm">
                            <strong>Note:</strong> Using mock data. {error}
                        </p>
                    </div>
                )}
            </div>

            <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={CustomLabel}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={colors[index % colors.length]}
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend 
                            verticalAlign="bottom" 
                            height={36}
                            formatter={(value, entry) => (
                                <span style={{ color: entry.color }}>
                                    {value} ({entry.payload.percentage}%)
                                </span>
                            )}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.map((station, index) => (
                    <div key={station.name} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                            <div 
                                className="w-4 h-4 rounded-full mr-3"
                                style={{ backgroundColor: colors[index % colors.length] }}
                            ></div>
                            <h3 className="font-semibold text-gray-800">{station.name}</h3>
                        </div>
                        <div className="text-sm text-gray-600">
                            <p>Reservations: <span className="font-semibold">{station.value}</span></p>
                            <p>Percentage: <span className="font-semibold">{station.percentage}%</span></p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 text-center">
                <button 
                    onClick={fetchReservationsData}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                >
                    Refresh Data
                </button>
            </div>
        </div>
    );
};

export default ReservationsPieChart;