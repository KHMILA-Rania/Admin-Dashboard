import { ResponsivePie } from '@nivo/pie';
import { useTheme } from '@mui/material';
import { tokens } from '../theme';
import { useEffect, useState } from 'react';
import axios from 'axios';

const LineChart = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:3000/station');
        setStations(res.data || []);
      } catch (err) {
        console.error('Failed to fetch stations:', err);
        setStations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 20 }}>Loading charts...</div>;
  }

  if (stations.length === 0) {
    return <div style={{ textAlign: 'center', padding: 20 }}>No station data available</div>;
  }

  // Prepare rating ranges data
  const ratingRanges = {
    'Excellent (4.5-5.0)': 0,
    'Very Good (4.0-4.4)': 0,
    'Good (3.5-3.9)': 0,
    'Average (3.0-3.4)': 0,
    'Below Average (2.0-2.9)': 0,
    'Poor (1.0-1.9)': 0,
    'Not Rated': 0,
  };

  stations.forEach((station) => {
    const rating = station.averageRating || 0;
    if (rating === 0) ratingRanges['Not Rated']++;
    else if (rating >= 4.5) ratingRanges['Excellent (4.5-5.0)']++;
    else if (rating >= 4.0) ratingRanges['Very Good (4.0-4.4)']++;
    else if (rating >= 3.5) ratingRanges['Good (3.5-3.9)']++;
    else if (rating >= 3.0) ratingRanges['Average (3.0-3.4)']++;
    else if (rating >= 2.0) ratingRanges['Below Average (2.0-2.9)']++;
    else ratingRanges['Poor (1.0-1.9)']++;
  });

  const ratingRangesData = Object.entries(ratingRanges)
    .filter(([_, count]) => count > 0)
    .map(([range, count]) => ({
      id: range,
      label: range,
      value: count,
    }));

  // Prepare top stations data (top 6)
  const topStationsData = stations
    .filter((s) => s.averageRating && s.averageRating > 0)
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, 6)
    .map((station) => ({
      id: station.name,
      label: `${station.name} (${station.averageRating.toFixed(1)}⭐)`,
      value: Math.round(station.averageRating * 10),
      originalRating: station.averageRating,
    }));

  // Common legend style for both charts
  const legendSettings = {
    anchor: 'bottom',
    direction: 'column',
    justify: false,
    translateX: 0,
    translateY: 56,    // Push legend down under the pie
    itemsSpacing: 6,
    itemWidth: 160,
    itemHeight: 22,
    itemTextColor: colors.grey[100],
    itemDirection: 'left-to-right',
    itemOpacity: 1,
    symbolSize: 18,
    symbolShape: 'circle',
    effects: [
      {
        on: 'hover',
        style: {
          itemTextColor: colors.primary[500],
        },
      },
    ],
  };

  return (
    <div
      style={{
        display: 'flex',
        padding: 0,
        margin: 0,
        gap: 40,
        flexWrap: 'wrap',
        justifyContent: 'center',
        maxWidth: '100%',
      }}
    >
      {/* Ratings Pie Chart */}
      <div style={{ height: 600, width: 400, padding: 0, margin: 0 }}>
        <h3 style={{ textAlign: 'center', marginBottom: 8 }}>Station Ratings Distribution</h3>
        <ResponsivePie
          data={ratingRangesData}
          margin={{ top: 10, right: 80, bottom: 110, left: 80 }}
          innerRadius={0.5}
          padAngle={0.7}
          cornerRadius={3}
          activeOuterRadiusOffset={8}
          borderWidth={1}
          borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
          arcLinkLabelsSkipAngle={10}
          arcLinkLabelsTextColor={colors.grey[100]}
          arcLinkLabelsThickness={2}
          arcLinkLabelsColor={{ from: 'color' }}
          arcLabelsSkipAngle={10}
          arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
          colors={({ id }) => {
            switch (true) {
              case id.includes('Excellent'):
                return '#4CAF50';
              case id.includes('Very Good'):
                return '#8BC34A';
              case id.includes('Good'):
                return '#CDDC39';
              case id.includes('Average'):
                return '#FFC107';
              case id.includes('Below Average'):
                return '#FF9800';
              case id.includes('Poor'):
                return '#F44336';
              case id.includes('Not Rated'):
                return '#9E9E9E';
              default:
                return '#2196F3';
            }
          }}
          legends={[legendSettings]}
          tooltip={({ datum }) => (
            <div
              style={{
                padding: '8px 12px',
                background: 'white',
                border: '1px solid #ccc',
                borderRadius: 6,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                color: '#333',
                fontSize: 14,
              }}
            >
              <strong>{datum.value}</strong> stations rated <strong>{datum.id}</strong>
            </div>
          )}
        />
      </div>

      {/* Top Stations Pie Chart */}
      <div style={{ height: 600, width: 400, padding: 0, margin: 0 }}>
        <h3 style={{ textAlign: 'center', marginBottom: 8 }}>Top 6 Stations by Rating</h3>
        <ResponsivePie
          data={topStationsData}
          margin={{ top: 40, right: 80, bottom: 110, left: 80 }}
          innerRadius={0.5}
          padAngle={0.7}
          cornerRadius={3}
          activeOuterRadiusOffset={8}
          borderWidth={1}
          borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
          arcLinkLabelsSkipAngle={10}
          arcLinkLabelsTextColor={colors.grey[100]}
          arcLinkLabelsThickness={2}
          arcLinkLabelsColor={{ from: 'color' }}
          arcLabelsSkipAngle={10}
          arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
          colors={({ data }) => {
            const rating = data.originalRating;
            if (rating >= 4.5) return '#4CAF50';
            if (rating >= 4.0) return '#8BC34A';
            if (rating >= 3.5) return '#CDDC39';
            if (rating >= 3.0) return '#FFC107';
            return '#FF9800';
          }}
          legends={[legendSettings]}
          tooltip={({ datum }) => (
            <div
              style={{
                padding: '10px 15px',
                background: 'white',
                border: '1px solid #ccc',
                borderRadius: 8,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                color: '#333',
                fontSize: 14,
                minWidth: 200,
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{datum.id}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>
                  Rating: <strong>{datum.data.originalRating.toFixed(1)} ⭐</strong>
                </span>
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
};

export default LineChart;
