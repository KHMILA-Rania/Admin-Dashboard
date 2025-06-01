
import { ResponsivePie } from '@nivo/pie';
import { mockPieData as data } from '../data/mockData';
import { useTheme } from '@mui/material';
import { tokens } from '../theme';
import { useEffect, useState } from 'react';
import axios from 'axios';
const PieChart = () => {
      const [chartData, setChartData] = useState([]);
    const theme=useTheme();
    const colors=tokens(theme.palette.mode);
 useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await axios.get('http://localhost:3000/reservation/all'); // 🛠 Replace with your API
        const reservations = res.data.reservations;

        // Count reservations per station name
        const counts = {};
        reservations.forEach((r) => {
          const stationName = r.stationId?.name || 'Unknown';
          counts[stationName] = (counts[stationName] || 0) + 1;
        });

        // Convert to array and sort by value
        const sorted = Object.entries(counts)
          .map(([name, value]) => ({ id: name, label: name, value }))
          .sort((a, b) => b.value - a.value) // Descending order
          .slice(0, 5); // Take top 5

        setChartData(sorted);
      } catch (err) {
        console.error('Failed to fetch reservations:', err);
      }
    };

    fetchReservations();
  }, []);
    return ( 
       
            <ResponsivePie
      data={chartData}
      margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
      innerRadius={0.5}
      padAngle={0.7}
      cornerRadius={3}
      activeOuterRadiusOffset={8}
      borderWidth={1}
      borderColor={{
        from: 'color',
        modifiers: [['darker', 0.2]],
      }}
      arcLinkLabelsSkipAngle={10}
      arcLinkLabelsTextColor={colors.grey[100]}
      arcLinkLabelsThickness={2}
      arcLinkLabelsColor={{ from: 'color' }}
      arcLabelsSkipAngle={10}
      arcLabelsTextColor={{
        from: 'color',
        modifiers: [['darker', 2]],
      }}
      defs={[
        {
          id: 'dots',
          type: 'patternDots',
          background: 'inherit',
          color: 'rgba(255, 255, 255, 0.3)',
          size: 4,
          padding: 1,
          stagger: true,
        },
        {
          id: 'lines',
          type: 'patternLines',
          background: 'inherit',
          color: 'rgba(255, 255, 255, 0.3)',
          rotation: -45,
          lineWidth: 6,
          spacing: 10,
        },
      ]}
      fill={[
        { match: { id: 'ruby' }, id: 'dots' },
        { match: { id: 'c' }, id: 'dots' },
        { match: { id: 'go' }, id: 'dots' },
        { match: { id: 'python' }, id: 'dots' },
        { match: { id: 'scala' }, id: 'lines' },
        { match: { id: 'lisp' }, id: 'lines' },
        { match: { id: 'elixir' }, id: 'lines' },
        { match: { id: 'javascript' }, id: 'lines' },
      ]}
      legends={[
        {
          anchor: 'bottom',
          direction: 'row',
          justify: false,
          translateX: 0,
          translateY: 56,
          itemsSpacing: 0,
          itemWidth: 100,
          itemHeight: 18,
          itemTextColor: '#999',
          itemDirection: 'left-to-right',
          itemOpacity: 1,
          symbolSize: 18,
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
        padding: '6px 12px',
        background: 'white',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        color: '#3d4f70',
      }}
    >
      <strong>{datum.id}</strong> has <strong>{datum.value}</strong> reservations
    </div>
  )}
    />
        )
     
}
 
export default PieChart;