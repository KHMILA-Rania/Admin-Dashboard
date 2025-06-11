import { ResponsivePie } from '@nivo/pie';
import { useTheme } from '@mui/material';
import { tokens } from '../theme';
import { useEffect, useState } from 'react';
import axios from 'axios';

const PieChart = () => {
  const [chartData, setChartData] = useState([]);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await axios.get('http://localhost:3000/reservation/all');
        const reservations = res.data.reservations;

        const counts = {};
        reservations.forEach((r) => {
          const stationName = r.stationId?.name || 'Unknown';
          counts[stationName] = (counts[stationName] || 0) + 1;
        });

        const sorted = Object.entries(counts)
          .map(([name, value]) => ({ id: name, label: name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);

        setChartData(sorted);
      } catch (err) {
        console.error('Failed to fetch reservations:', err);
      }
    };

    fetchReservations();
  }, []);

  return (
    <div style={{ height: '500px', width: '100%' }}>
      <ResponsivePie
        data={chartData}
        margin={{ top: 20, right: 40, bottom: 50, left: 40 }}
        innerRadius={0.6}
        padAngle={1}
        cornerRadius={2}
        activeOuterRadiusOffset={6}
        borderWidth={1}
        borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor={colors.grey[100]}
        arcLinkLabelsThickness={1}
        arcLinkLabelsColor={{ from: 'color' }}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
        legends={[
          {
            anchor: 'left',
            direction: 'column',
            justify: false,
            translateY: 40,
            itemWidth: 80,
            itemsSpacing: 15,
            itemHeight: 14,
            itemTextColor: '#aaa',
            itemDirection: 'left-to-right',
            itemOpacity: 0.85,
            symbolSize: 10,
            symbolShape: 'circle',
            effects: [
              {
                on: 'hover',
                style: {
                  itemTextColor: '#000',
                },
              },
            ],
          },
        ]}
        tooltip={({ datum }) => (
          <div
            style={{
              padding: '6px 10px',
              background: 'white',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              color: '#3d4f70',
              fontSize: '13px',
            }}
          >
            <strong>{datum.id}</strong> has <strong>{datum.value}</strong> reservations
          </div>
        )}
      />
    </div>
  );
};

export default PieChart;
