import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { generateIDCard } from "../../utils/idGenerator";
import { generatePWDCard } from "../../utils/pwdGenerator";

export default function Application() {
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
  const [typeFilter, setTypeFilter] = useState("All");
  
  const [approvedModalOpen, setApprovedModalOpen] = useState(false);
  const [rejectedModalOpen, setRejectedModalOpen] = useState(false);

  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [confirmationStatus, setConfirmationStatus] = useState("loading"); 
  const [confirmationAction, setConfirmationAction] = useState(""); 
  
  const [viewModalContext, setViewModalContext] = useState("pending"); 
  
  useEffect(() => {
    if (confirmationModalOpen && confirmationStatus === "success") {
      const timer = setTimeout(() => {
        window.location.reload();
      }, 2000); 

      return () => clearTimeout(timer);
    }
  }, [confirmationStatus, confirmationModalOpen]);

 const handleButtonClick = async (action) => {
    if (!selectedMember?.remarks?.trim()) {
      setSelectedMember((prev) => ({
        ...prev,
        modalError: "Fill this information first",
      }));
      return;
    }

    const status = action === "Approve" ? "Approved" : "Rejected";

    setViewModalOpen(false);

    setConfirmationModalOpen(true);
    setConfirmationStatus("loading");
    setConfirmationAction(action);

    setSelectedMember((prev) => ({ ...prev, modalError: "" }));

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      let idCardUrl = null;
      let controlNumber = null;
      
      if (action === "Approve") {
        try {
          const controlNumberResponse = await fetch(
            "http://localhost/elder-dB/admin-process/generate_control_number.php",
            {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ 
                senior_id: selectedMember.senior_id || selectedMember._rawData?.senior_id || selectedMember.seniorId,
                pwd_id: selectedMember.pwd_id || selectedMember._rawData?.pwd_id
              })
            }
          );
          
          if (!controlNumberResponse.ok) {
            throw new Error("Failed to generate control number");
          }
          
          const controlNumberData = await controlNumberResponse.json();
          if (!controlNumberData.success) {
            throw new Error(controlNumberData.message || "Failed to generate control number");
          }
          
          controlNumber = controlNumberData.controlNumber;
          
          let cardDataUrl;
          if (selectedMember.applicationType === "ID") {
            cardDataUrl = await generateIDCard({ 
              ...selectedMember,
              Control_Number: controlNumber
            });
          } else if (selectedMember.applicationType === "PWD") {
            cardDataUrl = await generatePWDCard({ 
              ...selectedMember,
              Control_Number: controlNumber
            });
          }

          if (cardDataUrl) {
            const blob = await (await fetch(cardDataUrl)).blob();
            
            const formData = new FormData();
            const endpoint = selectedMember.applicationType === "ID" 
              ? "http://localhost/elder-dB/admin-process/save_id_card.php"
              : "http://localhost/elder-dB/admin-process/save_pwd_card.php";
              
            formData.append(
              selectedMember.applicationType === "ID" ? 'id_card' : 'pwd_card', 
              blob, 
              `${selectedMember.applicationType.toLowerCase()}_card_${controlNumber}.png`
            );
            
            if (selectedMember.applicationType === "ID") {
              formData.append('senior_id', 
                selectedMember.senior_id || selectedMember._rawData?.senior_id || selectedMember.seniorId);
            } else {
              formData.append('pwd_id', 
                selectedMember.pwd_id || selectedMember._rawData?.pwd_id);
            }
            
            formData.append('control_number', controlNumber);

            const uploadResponse = await fetch(
              endpoint,
              {
                method: "POST",
                credentials: "include",
                body: formData,
              }
            );

            if (!uploadResponse.ok) {
              throw new Error("Failed to upload card");
            }

            const uploadData = await uploadResponse.json();
            if (!uploadData.success) {
              throw new Error(uploadData.message || "Failed to save card");
            }
            
            idCardUrl = uploadData.filePath;
          }
        } catch (idError) {
          console.error("Card generation/upload failed:", idError);
          throw new Error("Card generation failed: " + idError.message);
        }
      }

      const response = await fetch(
        "http://localhost/elder-dB/admin-process/update_application_status.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            applicant_id: selectedMember.id,
            status,
            remarks: selectedMember.remarks,
            id_card_url: idCardUrl,
            control_number: controlNumber,
            application_type: selectedMember.applicationType
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to update application status");
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      setApplications((prev) => {
        const updatedApps = prev.map((app) =>
          app.id === selectedMember.id
            ? { ...app, status: status.toLowerCase(), remarks: selectedMember.remarks }
            : app
        );
        return updatedApps;
      });

      setConfirmationStatus("success");

      setSelectedMember(null);

      setTimeout(() => {
        setConfirmationModalOpen(false);
        setConfirmationStatus("loading");
        setConfirmationAction("");
        window.location.reload();
      }, 2000);

    } catch (error) {
      setConfirmationStatus("error");
      setSelectedMember((prev) => ({
        ...prev,
        modalError: error.message || "Failed to update status",
      }));

      setTimeout(() => {
        setConfirmationModalOpen(false);
        setConfirmationStatus("loading");
        setConfirmationAction("");
        setViewModalOpen(true);
      }, 2000);
    }
  };

 
  useEffect(() => {
    setTitle("Applications");
    fetchApplications();
  }, [setTitle]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Starting to fetch applications...');

      const response = await fetch('http://localhost/elder-dB/admin-process/fetch_applications.php', {
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

      console.log('Number of applications received:', data.applications.length);

      const formattedData = data.applications.map((app) => {
        // Validate status
        const status = app.status ? app.status.toLowerCase() : 'pending';
        if (!app.status) {
          console.warn(`No status provided for application ID ${app.app_id}. Defaulting to 'pending'.`);
        }
        if (!['pending', 'approved', 'rejected'].includes(status)) {
          console.warn(`Invalid status "${app.status}" for application ID ${app.app_id}. Defaulting to 'pending'.`);
        }

        return {
          id: app.app_id,
          name: app.full_name || 'Name not available',
          email: app.email || 'Email not available',
          dateRequested: app.formatted_date || 'Date not available',
          type: app.type || 'Type not available',
          status: status, 
          firstName: app.fname || '',
          middleName: app.mname || '',
          lastName: app.lname || '',
          extension: app.extension_name || '',
          applicationType: app.type || '',
          _rawData: app
        };
      });

      console.log('Formatted applications data:', formattedData);
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
      // Validate applicantId exists and is a positive integer
      if (!applicantId || !Number.isInteger(Number(applicantId)) || applicantId <= 0) {
        throw new Error('Invalid applicant ID: must be a positive integer');
      }

      setDetailsLoading(true);
      setDetailsError(null);

      const url = new URL(`http://localhost/elder-dB/admin-process/fetch_applicant_details.php`);
      url.searchParams.append('applicant_id', applicantId);

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

      // Add null check for applicantDetails
      if (!data.applicantDetails) {
        throw new Error('No applicant details in response');
      }

      // Create a safe applicant details object with fallback values
      const applicantDetails = {
        // Basic info
        id: applicantId,
        senior_id: data.applicantDetails.senior_id || '',
        modalError: "",
        fname: data.applicantDetails.fname || '',
        mname: data.applicantDetails.mname || '',
        lname: data.applicantDetails.lname || '',
        extension_name: data.applicantDetails.extension_name || '',
        // Profile image
        id_img: data.applicantDetails.id_img
          ? `http://localhost/elder-dB/admin-process/serve_image.php?file=${data.applicantDetails.id_img}`
          : null,
        // Other fields with fallbacks
        sex: data.applicantDetails.sex || '',
        religion: data.applicantDetails.religion || '',
        blood_type: data.applicantDetails.blood_type || '',
        bday: data.applicantDetails.bday || '',
        address: data.applicantDetails.address || '',
        civil_status: data.applicantDetails.civil_status || '',
        contact_no: data.applicantDetails.contact_no || '',
        email: data.applicantDetails.email || '',
        // Identification cards
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
        // Emergency contact
        emergency_contact_name: data.applicantDetails.emergency_contact_name || '',
        emergency_no: data.applicantDetails.emergency_no || '',
        // Application info
        applicationType: data.applicantDetails.application_type || '',
        status: data.applicantDetails.status || '',
        date_submitted: data.applicantDetails.date_submitted || '',
        member_since: data.applicantDetails.member_since || '',
        remarks: data.applicantDetails.remarks || '',
        // PWD-specific fields
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
        //Senior ID
        ID_Card_Image: data.applicantDetails.ID_Card_Image || ''
          ? `http://localhost/elder-dB/identification_cards/${data.applicantDetails.ID_Card_Image}?v=${Date.now()}`
          : null,
        ID_Control_Number: data.applicantDetails.ID_Control_Number || '',
        ID_Expiry: data.applicantDetails.ID_Expiry || '',
        signature: data.applicantDetails.signature
          ? `http://localhost/elder-dB/admin-process/serve_image.php?file=${data.applicantDetails.signature}`
          : null,

        // Raw data for debugging
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

  const handleRowClick = async (applicantId) => {
    console.log('Row clicked with ID:', applicantId);
    try {
      setSelectedMember({
        isLoading: true,
        error: null,
        modalError: "",
      });
      setViewModalOpen(true);
      
      console.log('Fetching details for ID:', applicantId);
      const details = await fetchApplicantDetails(applicantId);
      
      if (!details) {
        throw new Error('Failed to load applicant details');
      }

      setSelectedMember({
        ...details,
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
    const matchesSearch = `${item.name} ${item.email} ${item.type}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "All" || item.type === typeFilter;
    const isPending = item.status?.toLowerCase() === 'pending';
    return matchesSearch && matchesType && isPending;
    })
    .sort((a, b) => {
      if (sortBy === "name" || sortBy === "email" || sortBy === "type") {
        return sortOrder === "asc"
          ? a[sortBy].localeCompare(b[sortBy])
          : b[sortBy].localeCompare(a[sortBy]);
      } else if (sortBy === "dateRequested") {
        const dateA = new Date(a.dateRequested);
        const dateB = new Date(b.dateRequested);
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      }
      return 0;
    });
    console.log('Raw status values:', applications.map(app => ({ id: app.id, status: app.status, rawData: app._rawData?.status })));
    console.log('Filtered applications:', filteredApplications.map(app => ({ id: app.id, status: app.status })));

    useEffect(() => {
  console.log('Current applications state:', applications.map(app => ({
    id: app.id,
    status: app.status,
    rawStatus: app._rawData?.status
  })));
}, [applications]);

    if (loading) return <div className="text-center py-8">Loading applications...</div>;
    if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;

    return (
    <div className="w-full">
      {/* Filter Buttons */}
      <div className="flex space-x-4 mb-4">
        <button 
          onClick={() => setApprovedModalOpen(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Approved
        </button>
        <button 
          onClick={() => setRejectedModalOpen(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Rejected
        </button>
      </div>

      {/* Scrollable Table */}
      <div className="w-full overflow-x-auto max-h-[680px] border border-green-800 rounded-md">
        <table className="min-w-full text-xs sm:text-sm border-collapse table-fixed">
          <thead className="bg-green-800 text-white sticky top-0 z-10">
            <tr>
              <th className="w-[10%] p-3 text-center">No.</th>
              <th 
                className="w-[30%] p-3 text-center cursor-pointer hover:underline"
                onClick={() => handleSort("name")}
              >
                Name {sortBy === "name" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th 
                className="w-[30%] p-3 text-center cursor-pointer hover:underline"
                onClick={() => handleSort("email")}
              >
                Email {sortBy === "email" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th 
                className="w-[20%] p-3 text-center cursor-pointer hover:underline"
                onClick={() => handleSort("dateRequested")}
              >
                Date {sortBy === "dateRequested" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th className="w-[20%] p-3 text-center">
                <select
                  className="w-full px-2 py-1 text-white text-xs rounded focus:outline-none"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option style={{ color: 'black' }} value="All">Types</option>
                  <option style={{ color: 'black' }} value="ID">ID</option>
                  <option style={{ color: 'black' }} value="PWD">PWD</option>
                  <option style={{ color: 'black' }} value="Pension">Pension</option>
                </select>
              </th>
            </tr>
          </thead>

          <tbody className="text-black text-center">
            {filteredApplications.map((item, index) => (
              <tr
                key={item.id}
                className="bg-white border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition"
                onClick={async () => {
                  setViewModalContext("pending");
                  // Immediately show basic info from the table row
                  setSelectedMember({
                    ...item,  // Spread all basic info from the table
                    isLoading: true,  // Show loading state for additional details
                    error: null  // Clear any previous errors
                  });
                  setViewModalOpen(true);
                  
                  // Then fetch additional details in the background
                  try {
                    const details = await fetchApplicantDetails(item.id);
                    setSelectedMember(prev => ({
                      ...prev,
                      ...details,
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
              >
                <td className="w-[10%] p-3">{index + 1}</td>
                <td className="w-[30%] p-3 break-words">{item.name}</td>
                <td className="w-[30%] p-3 break-words">{item.email}</td>
                <td className="w-[20%] p-3">{item.dateRequested}</td>
                <td className="w-[20%] p-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    item.type === "ID" 
                      ? "bg-blue-200 text-blue-800" 
                      : item.type === "PWD" 
                        ? "bg-purple-200 text-purple-800" 
                        : "bg-green-200 text-green-800"
                  }`}>
                    {item.type}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Approved Applications Modal */}
      {approvedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 backdrop-blur-sm px-4 py-6 overflow-y-auto">
          <div className="bg-white rounded-lg w-full max-w-6xl mx-4 p-6 flex flex-col" style={{ height: '95vh' }}>
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Approved Applications</h2>
              <button 
                onClick={() => setApprovedModalOpen(false)}
                className="text-2xl leading-none p-1 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <hr className="mb-4" />

            {/* Modal Body - Table for Approved Applications */}
            <div className="overflow-y-auto flex-1">
              <div className="w-full overflow-x-auto max-h-[500px] border border-green-800 rounded-md">
                <table className="min-w-full text-xs sm:text-sm border-collapse table-fixed">
                  <thead className="bg-green-800 text-white sticky top-0 z-10">
                    <tr>
                      <th className="w-[10%] p-3 text-center">No.</th>
                      <th className="w-[30%] p-3 text-center">Name</th>
                      <th className="w-[30%] p-3 text-center">Email</th>
                      <th className="w-[20%] p-3 text-center">Date</th>
                      <th className="w-[20%] p-3 text-center">Type</th>
                    </tr>
                  </thead>
                  <tbody className="text-black text-center">
                    {applications.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-4 text-gray-500">No applications available.</td>
                      </tr>
                    ) : applications.filter(app => {
                        const status = app.status?.toLowerCase();
                        console.log(`Approved Modal - App ID: ${app.id}, Status: ${app.status}`); // Debug log
                        return status === 'approved';
                      }).length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-4 text-gray-500">No approved applications found.</td>
                      </tr>
                    ) : (
                      applications
                        .filter(app => app.status?.toLowerCase() === 'approved')
                        .map((item, index) => (
                          <tr
                            key={item.id}
                            className="bg-white border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition"
                            onClick={async () => {
                              setViewModalContext("approved"); // Set context for approved applications
                              setSelectedMember({
                                ...item,
                                isLoading: true,
                                error: null
                              });
                              setViewModalOpen(true);
                              try {
                                const details = await fetchApplicantDetails(item.id);
                                setSelectedMember(prev => ({
                                  ...prev,
                                  ...details,
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
                          >
                            <td className="w-[10%] p-3">{index + 1}</td>
                            <td className="w-[30%] p-3 break-words">{item.name}</td>
                            <td className="w-[30%] p-3 break-words">{item.email}</td>
                            <td className="w-[20%] p-3">{item.dateRequested}</td>
                            <td className="w-[20%] p-3">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                item.type === "ID" 
                                  ? "bg-blue-200 text-blue-800" 
                                  : item.type === "PWD" 
                                    ? "bg-purple-200 text-purple-800" 
                                    : "bg-green-200 text-green-800"
                              }`}>
                                {item.type}
                              </span>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-end">
                <button 
                 onClick={() => {
                  setApprovedModalOpen(false);
                  setViewModalContext("pending"); // Add this line
                }}
                  className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejected Applications Modal */}
      {rejectedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 backdrop-blur-sm px-4 py-6 overflow-y-auto">
          <div className="bg-white rounded-lg w-full max-w-6xl mx-4 p-6 flex flex-col" style={{ height: '95vh' }}>
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Rejected Applications</h2>
              <button 
                onClick={() => setRejectedModalOpen(false)}
                className="text-2xl leading-none p-1 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <hr className="mb-4" />

            {/* Modal Body - Table for Rejected Applications */}
            <div className="overflow-y-auto flex-1">
              <div className="w-full overflow-x-auto max-h-[500px] border border-green-800 rounded-md">
                <table className="min-w-full text-xs sm:text-sm border-collapse table-fixed">
                  <thead className="bg-green-800 text-white sticky top-0 z-10">
                    <tr>
                      <th className="w-[10%] p-3 text-center">No.</th>
                      <th className="w-[30%] p-3 text-center">Name</th>
                      <th className="w-[30%] p-3 text-center">Email</th>
                      <th className="w-[20%] p-3 text-center">Date</th>
                      <th className="w-[20%] p-3 text-center">Type</th>
                    </tr>
                  </thead>
                  <tbody className="text-black text-center">
                    {applications.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-4 text-gray-500">No applications available.</td>
                      </tr>
                    ) : applications.filter(app => {
                        const status = app.status?.toLowerCase();
                        console.log(`Rejected Modal - App ID: ${app.id}, Status: ${app.status}`); // Debug log
                        return status === 'rejected';
                      }).length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-4 text-gray-500">No rejected applications found.</td>
                      </tr>
                    ) : (
                      applications
                        .filter(app => app.status?.toLowerCase() === 'rejected')
                        .map((item, index) => (
                          <tr
                            key={item.id}
                            className="bg-white border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition"
                            onClick={async () => {
                              setViewModalContext("rejected"); // Set context for rejected applications
                              setSelectedMember({
                                ...item,
                                isLoading: true,
                                error: null
                              });
                              setViewModalOpen(true);
                              try {
                                const details = await fetchApplicantDetails(item.id);
                                setSelectedMember(prev => ({
                                  ...prev,
                                  ...details,
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
                          >
                            <td className="w-[10%] p-3">{index + 1}</td>
                            <td className="w-[30%] p-3 break-words">{item.name}</td>
                            <td className="w-[30%] p-3 break-words">{item.email}</td>
                            <td className="w-[20%] p-3">{item.dateRequested}</td>
                            <td className="w-[20%] p-3">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                item.type === "ID" 
                                  ? "bg-blue-200 text-blue-800" 
                                  : item.type === "PWD" 
                                    ? "bg-purple-200 text-purple-800" 
                                    : "bg-green-200 text-green-800"
                              }`}>
                                {item.type}
                              </span>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>


            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-end">
                <button 
                  onClick={() => {
                  setRejectedModalOpen(false);
                  setViewModalContext("pending"); 
                }}
                  className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmationModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 flex flex-col items-center">
            {confirmationStatus === "loading" ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <p className="mt-4 text-lg font-medium">
                  {confirmationAction === "Approve" ? "Approving Applicant..." : "Rejecting Applicant..."}
                </p>
              </>
            ) : (
              <>
                <svg
                  className="w-12 h-12 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                <p className="mt-4 text-lg font-medium">
                  Application {confirmationAction === "Approve" ? "Approved!" : "Rejected!"}
                </p>
              </>
            )}
          </div>
        </div>
      )}

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
                &times;
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
                          e.target.src = ''; // Clear the broken image
                          e.target.className = 'hidden'; // Hide the broken image
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

                    {/* Disability Section - Only for PWD */}
                    {selectedMember.applicationType === "PWD" && (
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

                    {/* Identification Cards/Documents Section */}
                    <h3 className="font-medium mt-6 mb-2">
                      {selectedMember.applicationType === "PWD" ? "Documents" : "Identification Cards"}
                    </h3>
                    <hr className="mb-4" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedMember.applicationType === "PWD" ? (
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
                      ) : (
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
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Date Submitted</label>
                        <input 
                          type="text" 
                          className="w-full border border-gray-300 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm" 
                          value={selectedMember.date_submitted || ''} 
                          disabled 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <input 
                          type="text" 
                          className="w-full border border-gray-300 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm" 
                          value={selectedMember.status || ''} 
                          disabled 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Application Type</label>
                        <input 
                          type="text" 
                          className="w-full border border-gray-300 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm" 
                          value={selectedMember.applicationType || ''} 
                          disabled 
                        />
                      </div>
                    </div>
                    
                    {/* Remarks */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium mb-1">Remarks</label>
                      <textarea
                        className={`w-full border text-gray-700 px-3 py-2 rounded text-sm resize-y min-h-[100px] ${
                          selectedMember.modalError ? "border-red-500" : "border-gray-300"
                        } ${viewModalContext !== "pending" ? "bg-gray-100" : "focus:ring-2 focus:ring-blue-500 focus:border-blue-500"}`}
                        value={selectedMember.remarks || ""}
                        onChange={(e) => {
                          if (viewModalContext === "pending") {
                            setSelectedMember({
                              ...selectedMember,
                              remarks: e.target.value,
                              modalError: e.target.value.trim() ? "" : selectedMember.modalError,
                            });
                          }
                        }}
                        placeholder="Enter remarks here..."
                        rows={4}
                        disabled={viewModalContext !== "pending"} // Disable for approved/rejected
                      />
                      {selectedMember.modalError && (
                        <p className="text-red-500 text-sm mt-1">{selectedMember.modalError}</p>
                      )}
                    </div>

                    {viewModalContext === "approved" && (selectedMember.applicationType === "ID" || selectedMember.applicationType === "PWD") && (
                      <>
                        <h3 className="font-medium mt-6 mb-2">
                          {selectedMember.applicationType === "ID" ? "Senior ID" : "PWD ID"}
                        </h3>
                        <hr className="mb-4" />
                        <div className="flex flex-col items-center mb-4">
                          {selectedMember.applicationType === "ID" ? (
                            selectedMember.ID_Card_Image ? (
                              <img 
                                src={selectedMember.ID_Card_Image} 
                                alt="Senior ID" 
                                className="w-full max-w-md border border-gray-300 rounded" 
                                style={{ height: 'auto', maxHeight: '300px' }}
                              />
                            ) : (
                              <div className="w-full max-w-md border-2 border-dashed border-gray-300 rounded flex items-center justify-center" style={{ height: '200px' }}>
                                <span className="text-gray-500">No Senior ID Available</span>
                              </div>
                            )
                          ) : (
                            selectedMember.PWD_Card_Image ? (
                              <img 
                                src={selectedMember.PWD_Card_Image} 
                                alt="PWD ID" 
                                className="w-full max-w-md border border-gray-300 rounded" 
                                style={{ height: 'auto', maxHeight: '300px' }}
                              />
                            ) : (
                              <div className="w-full max-w-md border-2 border-dashed border-gray-300 rounded flex items-center justify-center" style={{ height: '200px' }}>
                                <span className="text-gray-500">No PWD ID Available</span>
                              </div>
                            )
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Control Number</label>
                            <input 
                              type="text" 
                              className="w-full border border-gray-300 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm" 
                              value={selectedMember.applicationType === "ID" 
                                ? selectedMember.ID_Control_Number || '' 
                                : selectedMember.PWD_Control_Number || ''} 
                              disabled 
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Expiry</label>
                            <input 
                              type="text" 
                              className="w-full border border-gray-300 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm" 
                              value={selectedMember.applicationType === "ID" 
                                ? selectedMember.ID_Expiry || '' 
                                : selectedMember.PWD_Expiry || ''} 
                              disabled 
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Signature Section - Only for ID and PWD types */}
                    {(selectedMember.applicationType === "ID" || selectedMember.applicationType === "PWD") && (
                      <div>
                        <label className="block text-sm font-medium mb-1">Signature</label>
                        {selectedMember.signature ? (
                          <div className="w-full border border-gray-300 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm">
                            <a 
                              href={selectedMember.signature} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              View Signature
                            </a>
                          </div>
                        ) : (
                          <div className="w-full border border-gray-300 bg-gray-100 text-gray-500 px-3 py-2 rounded text-sm">
                            No Signature uploaded
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex flex-wrap justify-end gap-2">
                    <button 
                      onClick={() => setViewModalOpen(false)} 
                      className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded transition-all text-sm sm:text-base"
                    >
                      Close
                    </button>
                    {viewModalContext === "pending" && (
                      <>
                        <button 
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-all text-sm sm:text-base"
                          onClick={() => handleButtonClick('Reject')}
                        >
                          Reject
                        </button>
                        <button 
                          className="px-4 py-2 text-white bg-green-700 hover:bg-green-800 rounded transition-all text-sm sm:text-base"
                          onClick={() => handleButtonClick('Approve')}
                        >
                          Approve
                        </button>
                      </>
                    )}
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