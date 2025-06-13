import { useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Chart } from 'chart.js/auto';

import members from '../../assets/admin-assets/members.svg';
import idIcon from '../../assets/admin-assets/id.svg';
import pension from '../../assets/admin-assets/pension.svg';

function Dashboard() {
  const chartRef = useRef(null);
  const { searchQuery, setTitle } = useOutletContext();
  const [counts, setCounts] = useState({
    members: 0,
    ids: 0,
    pensions: 0
  });
  const [loading, setLoading] = useState(true);
  const [updates, setUpdates] = useState([]);
  const [events, setEvents] = useState([]);
  const [chartData, setChartData] = useState(null);

  const formatDate = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  useEffect(() => {
    setTitle('Dashboard');

    // Fetch all data
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch counts
        const membersResponse = await fetch('http://localhost/elder-dB/admin-process/count.php?type=members');
        if (!membersResponse.ok) throw new Error(`Members count failed: ${membersResponse.statusText}`);
        const membersData = await membersResponse.json();
        if (membersData.error) throw new Error(`Members count error: ${membersData.error}`);

        const idsResponse = await fetch('http://localhost/elder-dB/admin-process/count.php?types=id,pwd_id');
        if (!idsResponse.ok) throw new Error(`IDs count failed: ${idsResponse.statusText}`);
        const idsData = await idsResponse.json();
        if (idsData.error) throw new Error(`IDs count error: ${idsData.error}`);

        const pensionsResponse = await fetch('http://localhost/elder-dB/admin-process/count.php?types=pension');
        if (!pensionsResponse.ok) throw new Error(`Pensions count failed: ${pensionsResponse.statusText}`);
        const pensionsData = await pensionsResponse.json();
        if (pensionsData.error) throw new Error(`Pensions count error: ${pensionsData.error}`);

        setCounts({
          members: membersData.count || 0,
          ids: idsData.count || 0,
          pensions: pensionsData.count || 0
        });

        // Fetch latest announcements
        const announcementsResponse = await fetch('http://localhost/elder-dB/admin-process/get_announcements.php?limit=3');
        if (!announcementsResponse.ok) throw new Error(`Announcements fetch failed: ${announcementsResponse.statusText}`);
        const announcementsData = await announcementsResponse.json();
        if (announcementsData.error) throw new Error(`Announcements error: ${announcementsData.error}`);

        const formattedUpdates = announcementsData.map(announcement => ({
          id: announcement.id,
          text: `${formatDate(announcement.created_at)} - ${announcement.title}`
        }));
        setUpdates(formattedUpdates);

        // Fetch upcoming events
        try {
        const now = new Date();
        const formattedDate = now.toISOString().split('T')[0];
        console.log('Formatted date:', formattedDate);
        const eventsUrl = `http://localhost/elder-dB/admin-process/get_events.php?after=${encodeURIComponent(formattedDate)}&limit=3`;
        console.log('Events URL:', eventsUrl);
        
        const eventsResponse = await fetch(eventsUrl);
        const responseText = await eventsResponse.text();
        console.log('Raw events response:', responseText);
        
        if (!eventsResponse.ok) {
        throw new Error(`Events fetch failed: ${eventsResponse.status} - ${responseText}`);
        }
        
        const eventsData = JSON.parse(responseText);
        if (eventsData.error) {
        throw new Error(`API error: ${eventsData.error}`);
        }
        
        console.log('Parsed events data:', eventsData);
        
        const formattedEvents = Array.isArray(eventsData) 
        ? eventsData.map(event => ({
        id: event.event_id || event.id,
        text: event.event_name,
        date: event.s_date
        }))
        : [];
        
        setEvents(formattedEvents);
        } catch (error) {
        console.error('Error fetching events:', error);
        setEvents([]);
        }

        // Fetch chart data
        const chartResponse = await fetch('http://localhost/elder-dB/admin-process/get_chart_data.php');
        if (!chartResponse.ok) throw new Error(`Chart data fetch failed: ${chartResponse.statusText}`);
        const chartData = await chartResponse.json();
        if (chartData.error) throw new Error(`Chart data error: ${chartData.error}`);
        setChartData(chartData);

      } catch (error) {
        console.error('Error fetching data:', error.message);
        setCounts({
          members: 0,
          ids: 0,
          pensions: 0
        });
        setUpdates([]);
        setEvents([]);
        setChartData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setTitle]);

  useEffect(() => {
    if (!chartRef.current || !chartData) return;

    // Initialize or update chart when chartData is available
    const chart = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels: chartData.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: '',
            data: chartData.data || [0, 0, 0, 0, 0, 0, 0, 0, 0],
            backgroundColor: ['#f4c542', '#2d6a4f'],
          },
        ],
      },
      options: { 
        responsive: true, 
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        }
      },
    });

    return () => chart.destroy();
  }, [chartData]);

  const truncateText = (text, maxLength = 30) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  };

  const filteredUpdates = updates
  .filter(update => update.text.toLowerCase().includes(searchQuery.toLowerCase()))
  .map(update => ({
    ...update,
    text: truncateText(update.text)
  }));

const filteredEvents = events
  .filter(event => event.text.toLowerCase().includes(searchQuery.toLowerCase()))
  .map(event => ({
    ...event,
    text: truncateText(event.text)
  }));

  return (
    <>
      {/* Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {[
          { image: members, label: 'Members', value: loading ? '...' : counts.members },
          { image: idIcon, label: 'IDs', value: loading ? '...' : counts.ids },
          { image: pension, label: 'Pension', value: loading ? '...' : counts.pensions },
        ].map(({ image, label, value }) => (
          <div key={label} className="bg-white p-6 rounded-lg shadow flex items-center">
            <img src={image} alt={label} className="w-10 h-10 mr-4 object-contain" />
            <div>
              <h6 className="text-sm">{label}</h6>
              <h3 className="text-2xl font-semibold">{value}</h3>
            </div>
          </div>
        ))}
      </section>

      {/* Chart + Updates */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-4">
          <h5 className="mb-4 font-semibold text-lg">Senior Statistics</h5>
          <div className="relative h-[300px]">
            <canvas ref={chartRef} className="absolute inset-0" />
            {loading && !chartData && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p>Loading chart data...</p>
              </div>
            )}
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h5 className="mb-2 font-semibold">Latest Updates</h5>
            <ul className="text-sm space-y-1">
              {loading ? (
                <li className="text-gray-400 italic">Loading updates...</li>
              ) : filteredUpdates.length > 0 ? (
                filteredUpdates.map((item) => (
                  <li key={item.id} title={item.text}>{item.text}</li>
                ))
              ) : (
                <li className="text-gray-400 italic">No matching updates</li>
              )}
            </ul>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h5 className="mb-2 font-semibold">Activities & Events</h5>
            <ul className="text-sm space-y-1">
              {loading ? (
                <li className="text-gray-400 italic">Loading events...</li>
              ) : filteredEvents.length > 0 ? (
                filteredEvents.map((item) => (
                  <li key={item.id} title={item.text}>{item.text}</li>
                ))
              ) : (
                <li className="text-gray-400 italic">No matching events</li>
              )}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}

export default Dashboard;