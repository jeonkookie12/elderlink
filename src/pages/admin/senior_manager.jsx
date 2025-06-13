import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";

export default function SeniorManager() {
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const { searchQuery, setTitle } = useOutletContext();
  const [applications, setApplications] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sortBy, setSortBy] = useState("dateRequested");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    setTitle("Senior Manager");
    fetchApplications();
  }, [setTitle]);

    const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Starting to fetch users...');

      const response = await fetch('http://localhost/elder-dB/admin-process/fetch_seniors.php', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      console.log('Fetch response received:', response);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response was not JSON');
      }

      const data = await response.json();
      console.log('Raw data received from server:', data);

      if (!data.success) {
        throw new Error(data.message || 'Request was not successful');
      }

      if (!Array.isArray(data.applications)) {
        console.error('Invalid applications data structure:', data);
        throw new Error('Expected applications array not found');
      }

      console.log('Number of users received:', data.applications.length);

      // Process users, combining applications by email
      const formattedData = data.applications.map(app => {
        const types = Array.isArray(app.types) ? app.types : [app.types];
        const statuses = Array.isArray(app.statuses) ? app.statuses : [app.statuses];
        const appIds = Array.isArray(app.app_ids) ? app.app_ids : (app.app_ids ? [app.app_ids] : null);

        // Create status mapping
        const statusMap = {};
        types.forEach((type, index) => {
          const status = statuses[index] || 'none';
          if (!['pending', 'approved', 'rejected', 'none'].includes(status)) {
            console.warn(`Invalid status "${status}" for type ${type}, email ${app.email}. Defaulting to 'none'.`);
            statusMap[type] = 'none';
          } else {
            statusMap[type] = status;
          }
        });

        return {
          id: app.user_id, 
          user_id: app.user_id,
          name: app.full_name || 'Name not available',
          email: app.email || 'Email not available',
          dateRequested: app.created_date || 'Date not available', 
          types: types.filter(type => type !== 'None'), 
          statuses: statusMap,
          app_ids: appIds,
          _rawData: app
        };
      });

      console.log('Formatted user data:', formattedData);
      setApplications(formattedData);
    } catch (error) {
      console.error('Fetch error:', error);
      setError(error.message);
      setApplications([]);
    } finally {
      setLoading(false);
      console.log('Fetch operation completed');
    }
  };

  const fetchApplicantDetails = async (applicantId) => {
    try {
      if (!applicantId || !Number.isInteger(Number(applicantId)) || applicantId <= 0) {
        throw new Error('Invalid applicant ID: must be a positive integer');
      }

      setDetailsLoading(true);
      setDetailsError(null);

      const url = new URL(`http://localhost/elder-dB/admin-process/fetch_senior_details.php`);
      url.searchParams.append('user_id', applicantId);

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        let errorText;
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = 'Could not read error response';
        }
        throw new Error(`Server error: ${response.status} - ${response.statusText}\n${errorText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const body = await response.text();
        throw new Error(`Expected JSON but got ${contentType}: ${body.substring(0, 100)}...`);
      }

      const data = await response.json();
      console.log('Raw API response:', data);

      if (!data?.success) {
        throw new Error(data?.message || 'Request failed without error message');
      }

      if (!data.applicantDetails) {
        throw new Error('No applicant details in response');
      }

      const applicantDetails = {
        id: applicantId,
        senior_id: data.applicantDetails.senior_id || '',
        modalError: "",
        fname: data.applicantDetails.fname || '',
        mname: data.applicantDetails.mname || '',
        lname: data.applicantDetails.lname || '',
        extension_name: data.applicantDetails.extension_name || '',
        id_img: data.applicantDetails.id_img
          ? `http://localhost/elder-dB/admin-process/serve_image.php?file=${data.applicantDetails.id_img}`
          : null,
        sex: data.applicantDetails.sex || '',
        religion: data.applicantDetails.religion || '',
        blood_type: data.applicantDetails.blood_type || '',
        bday: data.applicantDetails.bday || '',
        address: data.applicantDetails.address || '',
        civil_status: data.applicantDetails.civil_status || '',
        contact_no: data.applicantDetails.contact_no || '',
        email: data.applicantDetails.email || '',
        gsis: data.applicantDetails.gsis || ''
          ? `http://localhost/elder-dB/senior_id/${data.applicantDetails.gsis}`
          : null,
        tin: data.applicantDetails.tin || ''
          ? `http://localhost/elder-dB/senior_id/${data.applicantDetails.tin}`
          : null,
        sss: data.applicantDetails.sss || ''
          ? `http://localhost/elder-dB/senior_id/${data.applicantDetails.sss}`
          : null,
        philhealth: data.applicantDetails.philhealth || ''
          ? `http://localhost/elder-dB/senior_id/${data.applicantDetails.philhealth}`
          : null,
        emergency_contact_name: data.applicantDetails.emergency_contact_name || '',
        emergency_no: data.applicantDetails.emergency_no || '',
        applicationTypes: data.applicantDetails.application_type ? [data.applicantDetails.application_type] : [],
        statuses: data.applicantDetails.application_type
          ? { [data.applicantDetails.application_type]: data.applicantDetails.status || 'none' }
          : {},
        date_submitted: data.applicantDetails.date_submitted || '',
        member_since: data.applicantDetails.member_since || '',
        remarks: data.applicantDetails.remarks || '',
        pwd_id: data.applicantDetails.pwd_id || '',
        cause_of_disability: data.applicantDetails.cause_of_disability || '',
        type_of_disability: data.applicantDetails.type_of_disability || '',
        picture_1x1: data.applicantDetails.picture_1x1
          ? `http://localhost/elder-dB/pwd_documents/${data.applicantDetails.picture_1x1}`
          : null,
        government_id: data.applicantDetails.government_id
          ? `http://localhost/elder-dB/pwd_documents/${data.applicantDetails.government_id}`
          : null,
        medical_certificate: data.applicantDetails.medical_certificate
          ? `http://localhost/elder-dB/pwd_documents/${data.applicantDetails.medical_certificate}`
          : null,
        PWD_Card_Image: data.applicantDetails.PWD_Card_Image || ''
          ? `http://localhost/elder-dB/identification_cards/${data.applicantDetails.PWD_Card_Image}?v=${Date.now()}`
          : null,
        PWD_Control_Number: data.applicantDetails.PWD_Control_Number || '',
        PWD_Expiry: data.applicantDetails.PWD_Expiry || '',
        ID_Card_Image: data.applicantDetails.ID_Card_Image || ''
          ? `http://localhost/elder-dB/identification_cards/${data.applicantDetails.ID_Card_Image}?v=${Date.now()}`
          : null,
        ID_Control_Number: data.applicantDetails.ID_Control_Number || '',
        ID_Expiry: data.applicantDetails.ID_Expiry || '',
        signature: data.applicantDetails.signature
          ? `http://localhost/elder-dB/admin-process/serve_image.php?file=${data.applicantDetails.signature}`
          : null,
        _rawData: data.applicantDetails,
      };

      console.log('Fetched applicant details:', applicantDetails);
      return applicantDetails;
    } catch (error) {
      console.error('Fetch details error:', error);
      setDetailsError(error.message);
      return null;
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleRowClick = async (applicant) => {
    console.log('Row clicked with ID:', applicant.id);
    try {
      setSelectedMember({
        isLoading: true,
        error: null,
        modalError: "",
        email: applicant.email,
        applicationTypes: applicant.types,
        statuses: applicant.statuses
      });
      setViewModalOpen(true);

      console.log('Fetching details for ID:', applicant.id);
      const details = await fetchApplicantDetails(applicant.id);

      if (!details) {
        throw new Error('Failed to load applicant details');
      }

      // Combine all application types and statuses
      const combinedDetails = {
        ...details,
        applicationTypes: applicant.types,
        statuses: applicant.statuses
      };

      setSelectedMember({
        ...combinedDetails,
        isLoading: false
      });
    } catch (error) {
      setSelectedMember(prev => ({
        ...prev,
        isLoading: false,
        error: error.message
      }));
    }
  };

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  };

  const filteredApplications = [...applications]
    .filter(item => {
      return `${item.name} ${item.email}`.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      if (sortBy === "name" || sortBy === "email") {
        return sortOrder === "asc"
          ? a[sortBy].localeCompare(b[sortBy])
          : b[sortBy].localeCompare(a[sortBy]);
      } else if (sortBy === "dateRequested") {
        const dateA = a.dateRequested === 'Date not available' ? new Date(0) : new Date(a.dateRequested);
        const dateB = b.dateRequested === 'Date not available' ? new Date(0) : new Date(b.dateRequested);
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      }
      return 0;
    });

  if (loading) return <div className="text-center py-8">Loading users...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;

  return (
    <div className="w-full">
      {/* Scrollable Table */}
      <div className="w-full overflow-x-auto max-h-[680px] border border-green-800 rounded-md">
        <table className="min-w-full text-xs sm:text-sm border-collapse table-fixed">
          <thead className="bg-green-800 text-white sticky top-0 z-10">
            <tr>
              <th className="w-[10%] p-3 text-center">No.</th>
              <th 
                className="w-[35%] p-3 text-center cursor-pointer hover:underline"
                onClick={() => handleSort("name")}
              >
                Name {sortBy === "name" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th 
                className="w-[35%] p-3 text-center cursor-pointer hover:underline"
                onClick={() => handleSort("email")}
              >
                Email {sortBy === "email" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th 
                className="w-[20%] p-3 text-center cursor-pointer hover:underline"
                onClick={() => handleSort("dateRequested")}
              >
                Date Created {sortBy === "dateRequested" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
            </tr>
          </thead>

          <tbody className="text-black text-center">
            {filteredApplications.map((item, index) => (
              <tr
                key={item.user_id}
                className="bg-white border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition"
                onClick={() => handleRowClick(item)}
              >
                <td className="w-[10%] p-3">{index + 1}</td>
                <td className="w-[35%] p-3 break-words">{item.name}</td>
                <td className="w-[35%] p-3 break-words">{item.email}</td>
                <td className="w-[20%] p-3">{item.dateRequested}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {viewModalOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 backdrop-blur-sm px-4 py-6 overflow-y-auto">
          <div className="bg-white rounded-lg w-full max-w-3xl mx-4 p-6 flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">View Member Information</h2>
              <button 
                onClick={() => setViewModalOpen(false)}
                className="text-2xl leading-none p-1 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <hr className="mb-4" />

            {/* Loading State */}
            {selectedMember.isLoading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <p className="mt-2">Loading additional details...</p>
              </div>
            )}

            {/* Error State */}
            {selectedMember.error && (
              <div className="text-center py-8 text-red-500">
                Error loading details: {selectedMember.error}
                <button 
                  onClick={async () => {
                    setSelectedMember(prev => ({ ...prev, isLoading: true, error: null }));
                    try {
                      const details = await fetchApplicantDetails(selectedMember.id);
                      setSelectedMember(prev => ({
                        ...prev,
                        ...details,
                        applicationTypes: prev.applicationTypes,
                        statuses: prev.statuses,
                        isLoading: false
                      }));
                    } catch (error) {
                      setSelectedMember(prev => ({
                        ...prev,
                        isLoading: false,
                        error: error.message
                      }));
                    }
                  }}
                  className="ml-2 px-3 py-1 bg-blue-500 text-white rounded"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Content */}
            {!selectedMember.isLoading && !selectedMember.error && (
              <>
                <div className="overflow-y-auto flex-1">
                  {/* Profile Section */}
                  <div className="flex flex-col items-center mb-6">
                    {selectedMember.id_img ? (
                      <img
                        src={selectedMember.id_img}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover border-2 border-green-500"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '';
                          e.target.className = 'hidden';
                        }}
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full flex items-center justify-center bg-green-500 text-white text-2xl font-bold border-2 border-green-500">
                        {selectedMember.fname?.charAt(0)?.toUpperCase() || 
                         selectedMember.lname?.charAt(0)?.toUpperCase() || 
                         '?'}
                      </div>
                    )}
                    <span className="text-xs text-gray-500">Member since {selectedMember.member_since || ''}</span>
                  </div>

                  {/* Personal Information */}
                  <div className="space-y-4 pb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">First Name</label>
                        <input 
                          type="text" 
                          className="w-full border border-gray-300 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm" 
                          value={selectedMember.fname || ''} 
                          disabled 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Middle Name</label>
                        <input 
                          type="text" 
                          className="w-full border border-gray-300 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm" 
                          value={selectedMember.mname || ''} 
                          disabled 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Last Name</label>
                        <input 
                          type="text" 
                          className="w-full border border-gray-300 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm" 
                          value={selectedMember.lname || ''} 
                          disabled 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Extension</label>
                        <input 
                          className="w-full border border-gray-300 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm" 
                          value={selectedMember.extension_name || ''} 
                          disabled 
                        />
                      </div>
                    </div>

                    {/* Additional Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Sex</label>
                        <input 
                          type="text" 
                          className="w-full border border-gray-300 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm" 
                          value={selectedMember.sex || ''} 
                          disabled 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Religion</label>
                        <input 
                          type="text" 
                          className="w-full border border-gray-300 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm" 
                          value={selectedMember.religion || ''} 
                          disabled 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Blood Type</label>
                        <input 
                          type="text" 
                          className="w-full border border-gray-300 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm" 
                          value={selectedMember.blood_type || ''} 
                          disabled 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Civil Status</label>
                        <input 
                          type="text" 
                          className="w-full border border-gray-300 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm" 
                          value={selectedMember.civil_status || ''} 
                          disabled 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Contact No.</label>
                        <input 
                          type="text" 
                          className="w-full border border-gray-300 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm" 
                          value={selectedMember.contact_no || ''} 
                          disabled 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Email Address</label>
                        <input 
                          type="text" 
                          className="w-full border border-gray-300 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm" 
                          value={selectedMember.email || ''} 
                          disabled 
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Birthdate</label>
                        <input 
                          type="text" 
                          className="w-full border border-gray-300 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm" 
                          value={selectedMember.bday || ''} 
                          disabled 
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium mb-1">Full Address</label>
                        <input 
                          type="text" 
                          className="w-full border border-gray-300 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm" 
                          value={selectedMember.address || ''} 
                          disabled 
                        />
                      </div>
                    </div>

                    {/* Disability Information - If PWD application exists */}
                    {selectedMember.applicationTypes.includes("PWD") && (
                      <>
                        <h3 className="font-medium mt-6 mb-2">Disability Information</h3>
                        <hr className="mb-4" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Cause of Disability</label>
                            <input 
                              type="text" 
                              className="w-full border border-gray-300 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm" 
                              value={selectedMember.cause_of_disability || ''} 
                              disabled 
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Type of Disability</label>
                            <input 
                              type="text" 
                              className="w-full border border-gray-300 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm" 
                              value={selectedMember.type_of_disability || ''} 
                              disabled 
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Documents/Identification Cards */}
                    <h3 className="font-medium mt-6 mb-2">Documents and Identification Cards</h3>
                    <hr className="mb-4" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedMember.applicationTypes.includes("PWD") && (
                        <>
                          <div>
                            <label className="block text-sm font-medium mb-1">Government ID</label>
                            {selectedMember.government_id ? (
                              <div className="w-full border border-gray-300 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm">
                                <a 
                                  href={selectedMember.government_id} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  View Government ID
                                </a>
                              </div>
                            ) : (
                              <div className="w-full border border-gray-300 bg-gray-100 text-gray-500 px-3 py-2 rounded text-sm">
                                No Government ID uploaded
                              </div>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Medical Certificate</label>
                            {selectedMember.medical_certificate ? (
                              <div className="w-full border border-gray-300 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm">
                                <a 
                                  href={selectedMember.medical_certificate} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  View Medical Certificate
                                </a>
                              </div>
                            ) : (
                              <div className="w-full border border-gray-300 bg-gray-100 text-gray-500 px-3 py-2 rounded text-sm">
                                No Medical Certificate uploaded
                              </div>
                            )}
                          </div>
                        </>
                      )}
                      {selectedMember.applicationTypes.includes("ID") && (
                        <>
                          <div>
                            <label className="block text-sm font-medium mb-1">GSIS</label>
                            {selectedMember.gsis ? (
                              <div className="w-full border border-gray-300 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm">
                                <span className="text-gray-700">{selectedMember.gsis}</span>
                                <a 
                                  href={selectedMember.gsis}
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline ml-2"
                                >
                                  View
                                </a>
                              </div>
                            ) : (
                              <div className="w-full border border-gray-300 bg-gray-100 text-gray-500 px-3 py-2 rounded text-sm">
                                No GSIS uploaded
                              </div>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">TIN</label>
                            {selectedMember.tin ? (
                              <div className="w-full border border-gray-300 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm">
                                <span className="text-gray-700">{selectedMember.tin}</span>
                                <a 
                                  href={selectedMember.tin}
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline ml-2"
                                >
                                  View
                                </a>
                              </div>
                            ) : (
                              <div className="w-full border border-gray-300 bg-gray-100 text-gray-500 px-3 py-2 rounded text-sm">
                                No TIN uploaded
                              </div>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">SSS</label>
                            {selectedMember.sss ? (
                              <div className="w-full border border-gray-300 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm">
                                <span className="text-gray-700">{selectedMember.sss}</span>
                                <a 
                                  href={selectedMember.sss}
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline ml-2"
                                >
                                  View
                                </a>
                              </div>
                            ) : (
                              <div className="w-full border border-gray-300 bg-gray-100 text-gray-500 px-3 py-2 rounded text-sm">
                                No SSS uploaded
                              </div>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Philhealth</label>
                            {selectedMember.philhealth ? (
                              <div className="w-full border border-gray-300 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm">
                                <span className="text-gray-700">{selectedMember.philhealth}</span>
                                <a 
                                  href={selectedMember.philhealth}
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline ml-2"
                                >
                                  View
                                </a>
                              </div>
                            ) : (
                              <div className="w-full border border-gray-300 bg-gray-100 text-gray-500 px-3 py-2 rounded text-sm">
                                No Philhealth uploaded
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Emergency Contact */}
                    <h3 className="font-medium mt-6 mb-2">In case of emergency, please notify</h3>
                    <hr className="mb-4" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Contact Name</label>
                        <input 
                          type="text" 
                          className="w-full border border-gray-300 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm" 
                          value={selectedMember.emergency_contact_name || ''} 
                          disabled 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Emergency #</label>
                        <input 
                          type="text" 
                          className="w-full border border-gray-300 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm" 
                          value={selectedMember.emergency_no || ''} 
                          disabled 
                        />
                      </div>
                    </div>

                    {/* Application Status */}
                    <h3 className="font-medium mt-6 mb-2">Application Status</h3>
                    <hr className="mb-4" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Application Types</label>
                        <input 
                          type="text" 
                          className="w-full border border-gray-300 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm" 
                          value={selectedMember.applicationTypes.length > 0 ? selectedMember.applicationTypes.join(', ') : 'None'} 
                          disabled 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Statuses</label>
                        <input 
                          type="text" 
                          className="w-full border border-gray-300 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm" 
                          value={Object.entries(selectedMember.statuses).length > 0
                            ? Object.entries(selectedMember.statuses)
                                .map(([type, status]) => `${type}: ${status}`)
                                .join(', ')
                            : 'None'} 
                          disabled 
                        />
                      </div>
                    </div>

                    {/* Remarks */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium mb-1">Records</label>
                      <div className="w-full border border-gray-300 bg-gray-100 text-gray-600 px-3 py-2 rounded text-sm min-h-[100px]">
                        {selectedMember.remarks || 'No remarks available'}
                      </div>
                    </div>

                    {/* Senior ID */}
                    {selectedMember.applicationTypes.includes("id") && (
                      <>
                        <h3 className="font-medium mt-6 mb-4">Senior ID</h3>
                        <hr className="mb-4" />
                        <div className="flex flex-col items-center mb-4">
                          {selectedMember?.ID_Card_Image ? (
                            <img 
                              src={selectedMember?.ID_Card_Image} 
                              alt="Senior ID" 
                              className="w-full max-w-md border rounded-b" 
                              style={{ height: '200px', width: '350px' }}
                            />
                          ) : (
                            <div className="w-full max-w-md border-2 border-dashed border-gray-300 rounded flex items-center justify-center" style={{ height: '200px' }}>
                              <span className="text-gray-500">No Senior ID Available</span>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Control Number</label>
                            <input 
                              type="text" 
                              className="w-full border border-gray-300 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm" 
                              value={selectedMember.ID_Control_Number || ''} 
                              disabled 
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Expiry</label>
                            <input 
                              type="text" 
                              className="w-full border border-gray-300 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm" 
                              value={selectedMember.ID_Expiry || ''} 
                              disabled 
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* PWD */}
                    {selectedMember.applicationTypes.includes("pwd") && (
                      <>
                        <h3 className="font-medium mt-6 mb-2">PWD</h3>
                        <hr className="mb-4" />
                        <div className="flex flex-col items-center mb-4">
                          {selectedMember.PWD_Card_Image ? (
                            <img 
                              src={selectedMember.PWD_Card_Image} 
                              alt="PWD" 
                              className="w-full max-w-md border border-gray-300 rounded" 
                              style={{ height: '200px', width: '350px' }}
                            />
                          ) : (
                            <div className="w-full max-w-md border-2 border-dashed border-gray-300 rounded flex items-center justify-center" style={{ height: '200px' }}>
                              <span className="text-gray-500">No PWD application</span>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Control Number</label>
                            <input 
                              type="text" 
                              className="w-full border border-gray-300 bg-gray-100 text-gray-700" 
                              value={selectedMember.PWD_Control_Number || ''} 
                              disabled 
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Name</label>
                            <input 
                              type="text" 
                              className="w-full border border-gray-300 bg-gray-100 text-gray-700" 
                              value={selectedMember.full_name || ''} 
                              disabled 
                            />
                          </div>
                        </div>
                      </>
                    )}
                    </div>

                    {/* Modal Footer */}
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex flex-wrap justify-end gap-2">
                        <button 
                          onClick={() => setViewModalOpen(false)} 
                          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black rounded font-semibold transition-all duration-200 text-sm sm:text-base"
                        >
                          Close
                        </button>
                        {/*
                        <button 
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-semibold transition-all duration-200 text-sm sm:text-base"
                        >
                          Save
                        </button>
                        */}
                      </div>
                    </div>
                  </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}