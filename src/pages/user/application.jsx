import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../css/application.css';
import ReturnIcon from "../../assets/icons/back.svg";

const applications = [
  {
    application: 'Senior ID',
    description: 'Special identification for senior citizens',
    status: 'Ongoing',
  },
  {
    application: 'PWD ID',
    description: 'Special identification for persons with disabilities',
    status: 'Ongoing',
  },
  {
    application: 'Pension',
    description: 'Monthly pension application for eligible seniors',
    status: 'Ongoing',
  },
];

const Application = () => {
  const [activeTab, setActiveTab] = useState('Applications');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [applied, setApplied] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppliedApplications = async () => {
      try {
        const response = await fetch('http://localhost/elder-dB/user-process/fetch_applied_applications.php', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Unauthorized - Please login again');
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          console.error('Expected array but got:', data);
          throw new Error('Invalid data format received');
        }

        // Map database fields and transform application_type
        const mappedData = data.map(item => ({
          application: item.application_type === 'ID' ? 'Senior ID' : item.application_type === 'PWD' ? 'PWD ID' : item.application_type,
          dateApplied: item.app_created,
          status: item.status,
          remarks: item.remarks,
        }));

        setApplied(mappedData);
        setError(null);
      } catch (error) {
        console.error('Error fetching applied applications:', error);
        setApplied([]);
        setError('You haven\'t applied to any applications yet.');
      }
    };

    if (activeTab === 'Applied') {
      fetchAppliedApplications();
    }
  }, [activeTab]);

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const openModal = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleApplyNow = () => {
    navigate('/Application_Form', {
      state: { applicationType: selectedItem?.application }
    });
    closeModal();
  };

  const truncateText = (text, maxLength = 50) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  useEffect(() => {
    if (showModal) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [showModal]);

  const renderRequirements = (applicationType) => {
    switch (applicationType) {
      case 'Senior ID':
      case 'Pension':
        return (
          <ul className="list-disc ml-6 space-y-2">
            <li>Submit Accomplished Application Form (Apply Below)</li>
            <li>SSS ID</li>
            <li>TIN ID</li>
            <li>PhilHealth ID</li>
          </ul>
        );
      case 'PWD ID':
        return (
          <ul className="list-disc ml-6 space-y-2">
            <li>Submit Accomplished Application Form (Apply Below)</li>
            <li>One (1) Government Issued ID</li>
            <li>Medical Certificate</li>
          </ul>
        );
      default:
        return (
          <ul className="list-disc ml-6 space-y-2">
            <li>Submit Accomplished Application Form (Apply Below)</li>
            <li>PSA Birth Certificate</li>
            <li>One (1) Government Issued ID</li>
            <li>Proof of Residence (Barangay Clearance or Utility Bill)</li>
          </ul>
        );
    }
  };

  return (
    <>
      <div className="relative min-h-screen w-full flex flex-col items-center justify-start m-0 p-0 animate-float-down delay-500">
        <div className="w-full max-w-6xl mt-50 px-4 sm:px-6 md:px-8">
          <div className="relative w-full mb-6">
            <Link
              to="/user/user-dashboard"
              className="absolute left-0 -top-14 md:-top-16 group flex items-center space-x-2 transition-transform duration-300 transform hover:-translate-y-1 hover:drop-shadow-md"
            >
              <img
                src={ReturnIcon}
                alt="Return"
                className="w-6 h-6 md:w-8 md:h-8 transition-transform duration-300 group-hover:scale-105"
              />
              <span className="text-sm md:text-lg font-medium text-white">
                Return
              </span>
            </Link>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="relative flex bg-gray-200 rounded-full w-60 h-10 mb-6">
              <div
                className={`absolute top-0 left-0 h-10 w-1/2 bg-green-700 rounded-full shadow-md transition-transform duration-300 ${
                  activeTab === 'Applied' ? 'translate-x-full' : 'translate-x-0'
                }`}
              ></div>
              <button
                className={`relative z-10 w-1/2 h-full text-sm font-medium rounded-full transition-colors duration-300 ${
                  activeTab === 'Applications' ? 'bg-green-700 text-white' : 'text-gray-500'
                }`}
                onClick={() => setActiveTab('Applications')}
              >
                Applications
              </button>
              <button
                className={`relative z-10 w-1/2 h-full text-sm font-medium rounded-full transition-colors duration-300 ${
                  activeTab === 'Applied' ? 'bg-green-700 text-white' : 'text-gray-500'
                }`}
                onClick={() => setActiveTab('Applied')}
              >
                Applied
              </button>
            </div>

            <div className="overflow-x-auto w-full">
              <div className="min-w-[600px]">
                {activeTab === 'Applied' && applied.length === 0 && error ? (
                  <div className="text-center py-6 text-gray-500">
                    {error}
                  </div>
                ) : (
                  <table className="w-full table-auto rounded text-left">
                    <thead className="bg-gray-200 text-green-700">
                      <tr className="border-b border-gray-200 text-zinc-700">
                        {activeTab === 'Applications' ? (
                          <>
                            <th className="px-4 py-2 w-1/4">Application</th>
                            <th className="px-4 py-2 w-2/4">Description</th>
                            <th className="px-4 py-2 w-1/4">Status</th>
                          </>
                        ) : (
                          <>
                            <th className="px-4 py-2 w-1/3">Application</th>
                            <th className="px-4 py-2 w-1/3">Date Applied</th>
                            <th className="px-4 py-2 w-1/3">Status</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {(activeTab === 'Applications' ? applications : applied).map((item, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-gray-200 text-green-700 hover:bg-gray-100 cursor-pointer transition-colors"
                          onClick={() => openModal(item)}
                        >
                          <td className="px-4 py-4">{item.application}</td>
                          {activeTab === 'Applications' ? (
                            <>
                              <td className="px-4 py-4" title={item.description}>
                                {truncateText(item.description)}
                              </td>
                              <td className="px-4 py-4">{item.status}</td>
                            </>
                          ) : (
                            <>
                              <td className="px-4 py-4">{item.dateApplied}</td>
                              <td className="px-4 py-4">{item.status}</td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.5)] backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="text-xl font-bold text-green-800">
                {selectedItem?.application} Details
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="py-6 overflow-y-auto flex-grow">
              {activeTab === 'Applications' ? (
                <>
                  <div className="mb-6">
                    <h4 className="font-semibold text-lg mb-3">Requirements:</h4>
                    {renderRequirements(selectedItem?.application)}
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold text-lg mb-3">Application Process:</h4>
                    <ol className="list-decimal ml-6 space-y-2">
                      <li>Complete the application form</li>
                      <li>Submit required documents</li>
                      <li>Wait for verification (3-5 business days)</li>
                      <li>Receive confirmation via email</li>
                    </ol>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold text-lg mb-3">Description:</h4>
                    <p className="text-gray-700">{selectedItem?.application}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <h4 className="font-semibold">Application Type:</h4>
                      <p>{selectedItem?.application}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">Date Applied:</h4>
                      <p>{selectedItem?.dateApplied}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">Status:</h4>
                      <p className="capitalize">{selectedItem?.status}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold text-lg mb-3">Next Steps:</h4>
                    <ul className="list-disc ml-6 space-y-2">
                      <li>Wait for processing (typically 7-10 business days)</li>
                      <li>You will receive an email when your application is ready</li>
                    </ul>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold text-lg mb-3">Remarks:</h4>
                    <textarea
                      className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-700"
                      value={selectedItem?.remarks || 'No remarks available'}
                      disabled
                      rows={4}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="border-t pt-4 flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={closeModal}
              >
                Close
              </button>
              {activeTab === 'Applications' && (
                <button
                  onClick={handleApplyNow}
                  className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800 transition-colors"
                >
                  Apply Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Application;