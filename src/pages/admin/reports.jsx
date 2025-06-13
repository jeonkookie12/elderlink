import { useState, useRef, useEffect } from 'react';
import membersIcon from '../../assets/admin-assets/members.svg';
import idIcon from '../../assets/admin-assets/id.svg';
import pensionIcon from '../../assets/admin-assets/pension.svg';
import reportsIcon from '../../assets/admin-assets/reports-icon.png';
import Chart from 'chart.js/auto';

function AdminReports() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [counts, setCounts] = useState({
    members: 0,
    ids: 0,
    pensions: 0,
  });
  const [statusCounts, setStatusCounts] = useState({
    seniorId: { Pending: 0, Approved: 0, Rejected: 0 },
    pwdId: { Pending: 0, Approved: 0, Rejected: 0 },
    pension: { Pending: 0, Approved: 0, Rejected: 0 },
  });
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);
  const barRef = useRef(null);
  const pieRef = useRef(null);
  const pensionBarRef = useRef(null);
  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const pensionBarChartRef = useRef(null);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoading(true);

        const [
          membersResponse,
          idsResponse,
          pensionsResponse,
          seniorIdResponse,
          pwdIdResponse,
          pensionResponse,
        ] = await Promise.all([
          fetch('http://localhost/elder-dB/admin-process/count.php?type=members'),
          fetch('http://localhost/elder-dB/admin-process/count.php?types=id,pwd_id'),
          fetch('http://localhost/elder-dB/admin-process/count.php?types=pension'),
          fetch('http://localhost/elder-dB/admin-process/count.php?type=status_counts&application_type=id'),
          fetch('http://localhost/elder-dB/admin-process/count.php?type=status_counts&application_type=pwd_id'),
          fetch('http://localhost/elder-dB/admin-process/count.php?type=status_counts&application_type=pension'),
        ]);

        if (!membersResponse.ok) throw new Error('Members count failed');
        if (!idsResponse.ok) throw new Error('IDs count failed');
        if (!pensionsResponse.ok) throw new Error('Pensions count failed');
        if (!seniorIdResponse.ok) throw new Error('Senior ID status count failed');
        if (!pwdIdResponse.ok) throw new Error('PWD ID status count failed');
        if (!pensionResponse.ok) throw new Error('Pension status count failed');

        const [
          membersData,
          idsData,
          pensionsData,
          seniorIdData,
          pwdIdData,
          pensionData,
        ] = await Promise.all([
          membersResponse.json(),
          idsResponse.json(),
          pensionsResponse.json(),
          seniorIdResponse.json(),
          pwdIdResponse.json(),
          pensionResponse.json(),
        ]);

        setCounts({
          members: membersData.count || 0,
          ids: idsData.count || 0,
          pensions: pensionsData.count || 0,
        });

        setStatusCounts({
          seniorId: {
            Pending: seniorIdData.Pending || 0,
            Approved: seniorIdData.Approved || 0,
            Rejected: seniorIdData.Rejected || 0,
          },
          pwdId: {
            Pending: pwdIdData.Pending || 0,
            Approved: pwdIdData.Approved || 0,
            Rejected: pwdIdData.Rejected || 0,
          },
          pension: {
            Pending: pensionData.Pending || 0,
            Approved: pensionData.Approved || 0,
            Rejected: pensionData.Rejected || 0,
          },
        });
      } catch (error) {
        console.error('Error fetching counts:', error);
        setCounts({
          members: 0,
          ids: 0,
          pensions: 0,
        });
        setStatusCounts({
          seniorId: { Pending: 0, Approved: 0, Rejected: 0 },
          pwdId: { Pending: 0, Approved: 0, Rejected: 0 },
          pension: { Pending: 0, Approved: 0, Rejected: 0 },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();

    // Handle click outside for dropdown
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (barRef.current && !barChartRef.current) {
      barChartRef.current = new Chart(barRef.current, {
        type: 'bar',
        data: {
          labels: ['Pending', 'Approved', 'Rejected'], 
          datasets: [
            {
              label: 'Pending', 
              data: [statusCounts.seniorId.Pending || 0, 0, 0], 
              backgroundColor: '#f1c40f',
            },
            {
              label: 'Approved',
              data: [0, statusCounts.seniorId.Approved || 0, 0],
              backgroundColor: '#2ecc71',
            },
            {
              label: 'Rejected', 
              data: [0, 0, statusCounts.seniorId.Rejected || 0], 
              backgroundColor: '#e74c3c',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            title: {
              display: true,
              text: 'Senior ID Applications',
            },
            legend: {
              display: true,
              position: 'top',
              labels: {
                usePointStyle: true,
              },
            },
          },
          scales: {
            x: {
              stacked: true, 
            },
            y: {
              stacked: false,
              beginAtZero: true
            }
          }
        },
      });
    }

    if (pieRef.current && !pieChartRef.current) {
      pieChartRef.current = new Chart(pieRef.current, {
        type: 'pie',
        data: {
          labels: ['Pending', 'Approved', 'Rejected'],
          datasets: [
            {
              label: 'PWD ID Applications',
              data: [
                statusCounts.pwdId.Pending,
                statusCounts.pwdId.Approved,
                statusCounts.pwdId.Rejected,
              ],
              backgroundColor: ['#f1c40f', '#2ecc71', '#e74c3c'],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'PWD ID Applications',
            },
            legend: {
              display: true,
              position: 'top',
            },
          },
        },
      });
    }

    if (pensionBarRef.current && !pensionBarChartRef.current) {
      pensionBarChartRef.current = new Chart(pensionBarRef.current, {
        type: 'bar',
        data: {
          labels: ['Pending', 'Approved', 'Rejected'], 
          datasets: [
            {
              label: 'Pending', 
              data: [statusCounts.pension.Pending || 0, 0, 0], 
              backgroundColor: '#f1c40f',
            },
            {
              label: 'Approved', 
              data: [0, statusCounts.pension.Approved || 0, 0],
              backgroundColor: '#2ecc71',
            },
            {
              label: 'Rejected',
              data: [0, 0, statusCounts.pension.Rejected || 0], 
              backgroundColor: '#e74c3c',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            title: {
              display: true,
              text: 'Pension Applications',
            },
            legend: {
              display: true,
              position: 'top',
              labels: {
                usePointStyle: true,
              },
            },
          },
          scales: {
            x: {
              stacked: true, 
            },
            y: {
              stacked: false,
              beginAtZero: true
            }
          }
        },
      });
    }

    // Update chart data
    if (barChartRef.current) {
      barChartRef.current.data.datasets[0].data = [statusCounts.seniorId.Pending, 0, 0];
      barChartRef.current.data.datasets[1].data = [0, statusCounts.seniorId.Approved, 0];
      barChartRef.current.data.datasets[2].data = [0, 0, statusCounts.seniorId.Rejected];
      barChartRef.current.update();
    }

    if (pieChartRef.current) {
      pieChartRef.current.data.datasets[0].data = [
        statusCounts.pwdId.Pending,
        statusCounts.pwdId.Approved,
        statusCounts.pwdId.Rejected,
      ];
      pieChartRef.current.update();
    }

    if (pensionBarChartRef.current) {
      pensionBarChartRef.current.data.datasets[0].data = [statusCounts.pension.Pending, 0, 0];
      pensionBarChartRef.current.data.datasets[1].data = [0, statusCounts.pension.Approved, 0];
      pensionBarChartRef.current.data.datasets[2].data = [0, 0, statusCounts.pension.Rejected];
      pensionBarChartRef.current.update();
    }

    // Cleanup charts on component unmount
    return () => {
      if (barChartRef.current) {
        barChartRef.current.destroy();
        barChartRef.current = null;
      }
      if (pieChartRef.current) {
        pieChartRef.current.destroy();
        pieChartRef.current = null;
      }
      if (pensionBarChartRef.current) {
        pensionBarChartRef.current.destroy();
        pensionBarChartRef.current = null;
      }
    };
  }, [statusCounts]);


  return (
    
    <div className="flex h-screen overflow-hidden bg-gray-100">


      <main className="flex-1 flex flex-col overflow-y-auto transition-all">
        {/* Info Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
          <div className="bg-white shadow rounded-xl p-4 flex items-center justify-center gap-4 text-black">
            <img src={membersIcon} alt="Members" className="w-10 h-10" />
            <div>
              <p className="text-md">Members</p>
              <h3 className="text-xl font-bold">{loading ? '...' : counts.members}</h3>
            </div>
          </div>

          <div className="bg-white shadow rounded-xl p-4 flex items-center justify-center gap-4 text-black">
            <img src={idIcon} alt="IDs" className="w-10 h-10" />
            <div>
              <p className="text-md">IDs</p>
              <h3 className="text-xl font-bold">{loading ? '...' : counts.ids}</h3>
            </div>
          </div>

          <div className="bg-white shadow rounded-xl p-4 flex items-center justify-center gap-4 text-black">
            <img src={pensionIcon} alt="Pension" className="w-10 h-10" />
            <div>
              <p className="text-md">Pension</p>
              <h3 className="text-xl font-bold">{loading ? '...' : counts.pensions}</h3>
            </div>
          </div>

        </section>

        {/* Charts */}
        <section className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl shadow">
            <h2 className="text-lg font-semibold text-green-800 mb-4">Senior ID Applications</h2>
            <div className="chart-container">
              <canvas ref={barRef} className="w-full" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow">
            <h2 className="text-lg font-semibold text-green-800 mb-4">PWD ID Applications</h2>
            <div className="chart-container" style={{ height: '400px', width: '100%' }}>
              <canvas ref={pieRef} style={{ height: '100%', width: '100%' }} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow">
            <h2 className="text-lg font-semibold text-green-800 mb-4">Pension Applications</h2>
            <div className="chart-container">
              <canvas ref={pensionBarRef} className="w-full" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminReports;