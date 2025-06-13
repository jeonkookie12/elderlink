import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Application_Form() {
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [hasExistingApplication, setHasExistingApplication] = useState(null);
  const [existingAppModalOpen, setExistingAppModalOpen] = useState(false);
  const [applicationType, setApplicationType] = useState(null);
  const [errors, setErrors] = useState({});
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const dropdownRef = useRef(null);
  const [viewFile, setViewFile] = useState(null); 

  // Initialize formData
  const [formData, setFormData] = useState({
    lastname: '',
    firstname: '',
    middlename: '',
    suffix: '',
    birthdate: '',
    sex: '',
    bloodtype: '',
    maritalstatus: '',
    religion: '',
    contactnumber: '',
    email: '',
    address: '',
    photo: null,
    signature: null,
    causeOfDisability: '',
    typeOfDisability: '',
    gsis: null,
    tin: null,
    sss: null,
    philhealth: null,
    governmentId: null,
    medicalCertificate: null,
    confirmations: [false, false, false, false, false],
    emergencyName: '',
    emergencyContact: ''
  });

  // Set application type and check existing application
  useEffect(() => {
    // Set applicationType from location.state or keep null
    const newApplicationType = location.state?.applicationType || null;
    setApplicationType(newApplicationType);

    // Only check existing application if applicationType is set
    if (!newApplicationType) {
      console.warn('No applicationType provided in location.state');
      setHasExistingApplication(false);
      return;
    }

    const checkExistingApplication = async () => {
      try {
        // Map frontend applicationType to database-compatible value
        const dbApplicationType = {
          'Senior ID': 'ID',
          'PWD ID': 'PWD',
          'Pension': 'Pension'
        }[newApplicationType];

        if (!dbApplicationType) {
          console.error('Invalid applicationType:', newApplicationType);
          setHasExistingApplication(false);
          return;
        }

        console.log(`Checking application type: ${newApplicationType} (mapped to ${dbApplicationType})`);

        const response = await fetch(
          `http://localhost/elder-dB/user-process/check_application.php?application_type=${encodeURIComponent(
            dbApplicationType
          )}`,
          {
            method: 'GET',
            credentials: 'include',
          }
        );

        const result = await response.json();
        console.log('Check application response:', result);

        if (result.error) {
          console.error('Error from server:', result.error);
          setHasExistingApplication(false);
          return;
        }

        if (result.hasExistingApplication) {
          if (result.status !== 'Rejected') {
            setHasExistingApplication(true);
            setExistingAppModalOpen(true);
          } else {
            setHasExistingApplication(false);
          }
        } else {
          setHasExistingApplication(false);
        }
      } catch (error) {
        console.error('Error checking existing application:', error);
        setHasExistingApplication(false);
      }
    };

    checkExistingApplication();
  }, [location.state]);

  // Prevent page reload data loss warning
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      const isFormModified = Object.entries(formData).some(([key, value]) => {
        if (key === 'confirmations') return value.some(v => v);
        return value !== '' && value !== null && value !== false;
      });

      if (isFormModified) {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave? All entered data will be lost.';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formData]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.addEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (viewFile && viewFile.url) {
        URL.revokeObjectURL(viewFile.url);
      }
    };
  }, [viewFile]);

  // Validation functions (unchanged)
  const validateText = (value, fieldName) => {
    if (!value.trim()) return `${fieldName} is required`;
    if (/[0-9]/.test(value)) return `${fieldName} should contain only letters`;
    return '';
  };

  const validateContactNumber = (value) => {
    if (!value) return 'Contact number is required';
    if (!/^09\d{9}$/.test(value)) return 'Contact number must start with 09 and be 11 digits';
    return '';
  };

  const validateEmail = (value) => {
    if (!value) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
    return '';
  };

  const validateDate = (value, fieldName) => {
    if (!value) return `${fieldName} is required`;
    const today = new Date().toISOString().split('T')[0];
    if (value > today) return `${fieldName} cannot be a future date`;
    return '';
  };

  const validateRequired = (value, fieldName) => {
    if (!value) return `${fieldName} is required`;
    return '';
  };

  const validateFile = (file, fieldName) => {
    if (!file) return `${fieldName} is required`;
    if (file.size > 5 * 1024 * 1024) return 'File size must be less than 5MB';

    const fileExt = file.name.split('.').pop().toLowerCase();
    const imageFields = ['photo', 'signature', 'gsis', 'tin', 'sss', 'philhealth', 'governmentId'];
    const pdfFields = ['medicalCertificate'];

    if (imageFields.includes(fieldName) && !['png', 'jpg', 'jpeg'].includes(fileExt)) {
      return `${fieldName} must be a PNG, JPG, or JPEG file`;
    }
    if (pdfFields.includes(fieldName) && fileExt !== 'pdf') {
      return `${fieldName} must be a PDF file`;
    }

    return '';
  };

  const validateBloodType = (value) => {
    if (!value.trim()) return 'Blood Type is required';
    if (value !== 'N/A' && !/^(A|B|AB|O)[+-]?$/.test(value)) {
      return 'Invalid blood type (e.g., A+, B-, AB, O, or N/A)';
    }
    return '';
  };

  const validateReligion = (value) => {
    if (!value.trim()) return 'Religion is required';
    if (value !== 'N/A' && /[0-9]/.test(value)) {
      return 'Religion should contain only letters or be N/A';
    }
    return '';
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      newErrors.lastname = validateText(formData.lastname, 'Lastname');
      newErrors.firstname = validateText(formData.firstname, 'Firstname');
      newErrors.middlename = formData.middlename ? validateText(formData.middlename, 'Middlename') : '';
      newErrors.birthdate = validateDate(formData.birthdate, 'Birth date');
      newErrors.sex = validateRequired(formData.sex, 'Sex');
      newErrors.bloodtype = validateRequired(formData.bloodtype, 'Blood Type');
      newErrors.maritalstatus = validateRequired(formData.maritalstatus, 'Marital Status');
      newErrors.religion = validateReligion(formData.religion);
      newErrors.contactnumber = validateContactNumber(formData.contactnumber);
      newErrors.email = validateEmail(formData.email);
      newErrors.address = validateRequired(formData.address, 'Address');
      
      if (applicationType !== 'Pension') {
        newErrors.photo = validateFile(formData.photo, 'Photo');
      }
      
      if (applicationType === 'Senior ID' || applicationType === 'PWD ID') {
        newErrors.signature = validateFile(formData.signature, 'Signature');
      }
      
      if (applicationType === 'PWD ID') {
        newErrors.causeOfDisability = validateRequired(formData.causeOfDisability, 'Cause of disability');
        newErrors.typeOfDisability = validateRequired(formData.typeOfDisability, 'Type of disability');
      }
    } else if (step === 2) {
      if (applicationType === 'PWD ID') {
        newErrors.governmentId = validateFile(formData.governmentId, 'Government ID');
        newErrors.medicalCertificate = validateFile(formData.medicalCertificate, 'Medical Certificate');
      } else {
        newErrors.tin = validateFile(formData.tin, 'TIN ID');
        newErrors.sss = validateFile(formData.sss, 'SSS ID');
        newErrors.philhealth = validateFile(formData.philhealth, 'Philhealth ID');
      }
    } else if (step === 3) {
      formData.confirmations.forEach((confirmed, index) => {
        if (!confirmed) {
          newErrors[`confirmation-${index}`] = 'This confirmation is required';
        }
      });
      
      newErrors.emergencyName = validateText(formData.emergencyName, 'Emergency contact name');
      newErrors.emergencyContact = validateContactNumber(formData.emergencyContact);
    }
    
    setErrors(newErrors);
    return Object.values(newErrors).every(error => !error);
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    let newFormData = { ...formData };
    
    if (type === 'checkbox') {
      const index = parseInt(name.split('-')[1]);
      const newConfirmations = [...formData.confirmations];
      newConfirmations[index] = checked;
      newFormData = { ...newFormData, confirmations: newConfirmations };
    } else if (type === 'file') {
      const file = files[0];
      newFormData = { ...newFormData, [name]: file };
      
      // Validate file immediately and clear error if valid
      if (file) {
        const fileError = validateFile(file, name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()));
        if (!fileError) {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
          });
        } else {
          setErrors(prev => ({ ...prev, [name]: fileError }));
        }
      }
    } else {
      if ((name === 'contactnumber' || name === 'emergencyContact') && value.length > 0) {
        const numbersOnly = value.replace(/[^0-9]/g, '');
        let formattedValue = numbersOnly;
        if (numbersOnly.length > 0 && !numbersOnly.startsWith('09')) {
          formattedValue = '09' + numbersOnly.substring(2);
        }
        if (formattedValue.length > 11) {
          formattedValue = formattedValue.substring(0, 11);
        }
        newFormData = { ...newFormData, [name]: formattedValue };
      } else {
        newFormData = { ...newFormData, [name]: value };
      }
    }
    
    setFormData(newFormData);
    
    // Clear error when field is changed (except for files, handled above)
    if (type !== 'file' && errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    } else {
      const firstError = Object.keys(errors).find(key => errors[key]);
      if (firstError) {
        document.querySelector(`[name="${firstError}"]`)?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  };

  const handlePreviousStep = () => {
    setStep(step - 1);
  };

 const handleSubmit = async () => {
  if (!validateStep(3)) {
    const firstError = Object.keys(errors).find((key) => errors[key]);
    if (firstError) {
      document.querySelector(`[name="${firstError}"]`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
    return;
  }

    setIsSubmitting(true);
    setUploadProgress('Uploading...');

    try {
      const formDataToSend = new FormData();

      // Log formData state and applicationType
      console.log('Submitting user data:', formData); // Log entire formData state
      console.log('Application Type:', applicationType); // Log applicationType

      // Map applicationType to database-compatible values
      let dbApplicationType;
      switch (applicationType) {
        case 'Senior ID':
          dbApplicationType = 'ID';
          break;
        case 'PWD ID':
          dbApplicationType = 'PWD';
          break;
        case 'Pension':
          dbApplicationType = 'Pension';
          break;
        default:
          throw new Error('Invalid application type selected: ' + applicationType);
      }

      // Add all form data to FormData
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'confirmations' && value !== null && value !== '') {
          if (value instanceof File) {
            formDataToSend.append(key, value);
          } else if (typeof value === 'object') {
            formDataToSend.append(key, JSON.stringify(value));
          } else {
            formDataToSend.append(key, value);
          }
        }
      });

      // Append the mapped applicationType
      formDataToSend.append('applicationType', dbApplicationType);
      console.log('FormData to send:', Object.fromEntries(formDataToSend)); // Log final FormData

      const response = await fetch('http://localhost/elder-dB/user-process/submit_application.php', {
        method: 'POST',
        body: formDataToSend,
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success) {
        setUploadProgress('Submitting Application...');
        setTimeout(() => {
          setIsSubmitting(false);
          setShowSuccessModal(true);
          // Reset form
          setFormData({
            lastname: '',
            firstname: '',
            middlename: '',
            suffix: '',
            birthdate: '',
            sex: '',
            bloodtype: '',
            maritalstatus: '',
            religion: '',
            contactnumber: '',
            email: '',
            address: '',
            photo: null,
            signature: null,
            causeOfDisability: '',
            typeOfDisability: '',
            gsis: null,
            tin: null,
            sss: null,
            philhealth: null,
            governmentId: null,
            medicalCertificate: null,
            confirmations: [false, false, false, false, false],
            emergencyName: '',
            emergencyContact: '',
          });
          setErrors({});
          setStep(1);
        }, 1000);
      } else {
        throw new Error(result.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Submission error:', {
        message: error.message,
        status: error.response?.status,
      });
      setIsSubmitting(false);
      setShowErrorModal(true);
      setErrorMessage(error.message || 'Error submitting application');
    }
  };

  const renderFileInput = (name, label, stepNumber) => (
    <div>
      <label className="block font-medium text-sm mb-1">{label} <span className="text-red-500">*</span></label>
      <div className="flex items-center gap-2">
        <input
          type="file"
          id={name}
          name={name}
          onChange={handleChange}
          accept={
            name === 'medicalCertificate' 
              ? 'application/pdf' 
              : 'image/png,image/jpeg,image/jpg'
          }
          className={`w-full border ${errors[name] ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 bg-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold ${errors[name] ? 'file:bg-red-500 file:text-white hover:file:bg-red-600' : 'file:bg-green-700 file:text-white hover:file:bg-green-800'}`}
        />
        {formData[name] && (
          <span className="text-sm text-green-700 truncate max-w-[150px]">{formData[name].name}</span>
        )}
      </div>
      {errors[name] && <p className="text-red-500 text-sm">{errors[name]}</p>}
    </div>
  );

  const renderSignatureUpload = () => (
    <div className="mt-4">
      <h3 className="text-lg font-semibold">UPLOAD YOUR SIGNATURE</h3>
      <hr className="border-t border-gray-400 my-2" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="flex flex-col items-center">
          {formData.signature ? (
            <img 
              src={URL.createObjectURL(formData.signature)} 
              alt="Signature Preview"
              className="w-full h-48 object-contain border rounded mb-4 bg-white" 
            />
          ) : (
            <div className="w-full h-48 border rounded mb-4 flex items-center justify-center bg-gray-100">
              No signature uploaded
            </div>
          )}
          <p>Image must not exceed 5MB</p>
          <label className={`inline-block ${errors.signature ? 'bg-red-500' : 'bg-green-700'} text-white px-4 py-2 rounded cursor-pointer hover:${errors.signature ? 'bg-red-600' : 'bg-green-800'}`}>
            Upload Signature
            <input 
              type="file" 
              name="signature"
              accept="image/*" 
              onChange={handleChange}
              className="hidden" 
            />
          </label>
          {formData.signature && (
            <p className="text-sm text-green-700 mt-2 truncate max-w-full">{formData.signature.name}</p>
          )}
          {errors.signature && <p className="text-red-500 text-sm mt-1">{errors.signature}</p>}
        </div>
        <div>
          <p className="text-sm text-gray-600">
            Please upload a clear signature on white background. This signature will be used for your ID card.
          </p>
          <ul className="mt-2 text-sm text-gray-700">
            <li>Sign on a plain white paper with black ink</li>
            <li>Ensure the signature is clear and not cropped</li>
            <li className="text-red-500">Avoid signatures with background patterns or colors</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderDisabilityInfo = () => (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-4 bg-green-700 text-white py-2 px-4 rounded">Disability Information</h2>
      
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label htmlFor="causeOfDisability" className="block">Cause of Disability <span className="text-red-500">*</span></label>
          <select
            id="causeOfDisability"
            name="causeOfDisability"
            value={formData.causeOfDisability}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${errors.causeOfDisability ? 'border-red-500' : ''}`}
          >
            <option value="">Select cause</option>
            <option value="Accident">Accident</option>
            <option value="Illness">Illness</option>
            <option value="Congenital">Congenital</option>
          </select>
          {errors.causeOfDisability && <p className="text-red-500 text-sm">{errors.causeOfDisability}</p>}
        </div>
        
        <div>
          <label className="block">Type of Disability <span className="text-red-500">*</span></label>
          {errors.typeOfDisability && <p className="text-red-500 text-sm">{errors.typeOfDisability}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            {[
              "Cancer (RA11215)",
              "Intellectual Disability",
              "Mental Disability",
              "Psychosocial Disability",
              "Speech and Language Impairment",
              "Deaf or Hard of Hearing",
              "Learning Disability",
              "Physical Disability (Orthopedic)",
              "Rare Disease (RA10747)",
              "Visual Disability"
            ].map((type) => (
              <label key={type} className="flex items-center">
                <input
                  type="radio"
                  name="typeOfDisability"
                  value={type}
                  checked={formData.typeOfDisability === type}
                  onChange={handleChange}
                  className="mr-2"
                />
                {type}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-green-800">{applicationType} Application</h1>
        <p className="text-gray-600">Please complete the form below</p>
      </div>  

      <div className="flex items-center space-x-4 justify-center mb-8">
        <div className="w-8 h-8 rounded-full bg-green-700 text-white flex items-center justify-center">1</div>
        <div className="h-1 w-16 bg-green-700"></div>
        <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center">2</div>
        <div className="h-1 w-16 bg-green-700"></div>
        <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center">3</div>
      </div>

      <p className="text-gray-700 text-sm mb-4">
        Please fill up completely and correctly the required information below.
        Required items are marked with an asterisk (<span className="text-red-500">*</span>).
        For Blood Type and Religion, enter "N/A" if unknown.
      </p>

      <h2 className="text-xl font-bold mb-4 bg-green-700 text-white py-2 px-4 rounded">Personal Information</h2>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="lastname" className="block">Lastname <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              id="lastname" 
              name="lastname" 
              value={formData.lastname}
              onChange={handleChange}
              required 
              className={`w-full p-2 border rounded ${errors.lastname ? 'border-red-500' : ''}`} 
            />
            {errors.lastname && <p className="text-red-500 text-sm">{errors.lastname}</p>}
          </div>
          <div>
            <label htmlFor="firstname" className="block">Firstname <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              id="firstname" 
              name="firstname" 
              value={formData.firstname}
              onChange={handleChange}
              required 
              className={`w-full p-2 border rounded ${errors.firstname ? 'border-red-500' : ''}`} 
            />
            {errors.firstname && <p className="text-red-500 text-sm">{errors.firstname}</p>}
          </div>
          <div>
            <label htmlFor="middlename" className="block">Middlename</label>
            <input 
              type="text" 
              id="middlename" 
              name="middlename" 
              value={formData.middlename}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.middlename ? 'border-red-500' : ''}`} 
            />
            {errors.middlename && <p className="text-red-500 text-sm">{errors.middlename}</p>}
          </div>
          <div>
            <label htmlFor="suffix" className="block">Suffix</label>
            <select 
              id="suffix" 
              name="suffix" 
              value={formData.suffix}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value=""></option>
              <option value="Jr.">Jr.</option>
              <option value="Sr.">Sr.</option>
              <option value="II">II</option>
              <option value="III">III</option>
              <option value="IV">IV</option>
              <option value="V">V</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="birthdate" className="block">Birth Date <span className="text-red-500">*</span></label>
            <input 
              type="date" 
              id="birthdate" 
              name="birthdate" 
              value={formData.birthdate}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              className={`w-full p-2 border rounded ${errors.birthdate ? 'border-red-500' : ''}`} 
            />
            {errors.birthdate && <p className="text-red-500 text-sm">{errors.birthdate}</p>}
          </div>
          <div>
            <label htmlFor="sex" className="block">Sex at Birth <span className="text-red-500">*</span></label>
            <select 
              id="sex" 
              name="sex" 
              value={formData.sex}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.sex ? 'border-red-500' : ''}`}
            >
              <option value=""></option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            {errors.sex && <p className="text-red-500 text-sm">{errors.sex}</p>}
          </div>
          <div>
            <label htmlFor="bloodtype" className="block">Blood Type <span className="text-red-500">*</span></label>
            <select 
              id="bloodtype" 
              name="bloodtype" 
              value={formData.bloodtype}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.bloodtype ? 'border-red-500' : ''}`}
            >
              <option value="">Select Blood Type</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="N/A">N/A</option>
            </select>
            {errors.bloodtype && <p className="text-red-500 text-sm">{errors.bloodtype}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="maritalstatus" className="block">Marital Status <span className="text-red-500">*</span></label>
            <select 
              id="maritalstatus" 
              name="maritalstatus" 
              value={formData.maritalstatus}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.maritalstatus ? 'border-red-500' : ''}`}
            >
              <option value="">Select status</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="divorced">Divorced</option>
              <option value="widowed">Widowed</option>
            </select>
            {errors.maritalstatus && <p className="text-red-500 text-sm">{errors.maritalstatus}</p>}
          </div>
          <div>
            <label htmlFor="religion" className="block">Religion <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              id="religion" 
              name="religion" 
              value={formData.religion}
              onChange={handleChange}
              placeholder="e.g., Christian, Muslim, or N/A"
              className={`w-full p-2 border rounded ${errors.religion ? 'border-red-500' : ''}`} 
            />
            {errors.religion && <p className="text-red-500 text-sm">{errors.religion}</p>}
          </div>
          <div>
            <label htmlFor="contactnumber" className="block">Contact Number <span className="text-red-500">*</span></label>
            <input 
              type="tel" 
              id="contactnumber" 
              name="contactnumber" 
              value={formData.contactnumber}
              onChange={handleChange}
              maxLength="11"
              placeholder="09XXXXXXXXX"
              className={`w-full p-2 border rounded ${errors.contactnumber ? 'border-red-500' : ''}`} 
            />
            {errors.contactnumber && <p className="text-red-500 text-sm">{errors.contactnumber}</p>}
          </div>
          <div>
            <label htmlFor="email" className="block">Email Address <span className="text-red-500">*</span></label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.email ? 'border-red-500' : ''}`} 
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-1">
          <div>
            <label htmlFor="address" className="block">Address <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              id="address" 
              name="address" 
              value={formData.address}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.address ? 'border-red-500' : ''}`} 
            />
            {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
          </div>
        </div>

        {applicationType !== 'Pension' && (
          <>
            <h2 className="text-lg font-semibold mt-6">ATTACH YOUR LATEST PHOTO</h2>
            <hr className="border-t border-gray-400 my-2" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="flex flex-col items-center">
                {formData.photo ? (
                  <img 
                    src={URL.createObjectURL(formData.photo)} 
                    alt="Upload Preview" 
                    className="w-48 h-48 object-cover border rounded mb-4" 
                  />
                ) : (
                  <img src="/cam.png" alt="Upload Preview" className="w-48 h-48 object-cover border rounded mb-4" />
                )}
                <p>Image must not exceed 5MB</p>
                <label className={`inline-block ${errors.photo ? 'bg-red-500' : 'bg-green-700'} text-white px-4 py-2 rounded cursor-pointer hover:${errors.photo ? 'bg-red-600' : 'bg-green-800'}`}>
                  Upload Photo
                  <input 
                    type="file" 
                    name="photo"
                    accept="image/*" 
                    onChange={handleChange}
                    className="hidden" 
                  />
                </label>
                {formData.photo && (
                  <p className="text-sm text-green-700 mt-2 truncate max-w-full">{formData.photo.name}</p>
                )}
                {errors.photo && <p className="text-red-500 text-sm mt-1">{errors.photo}</p>}
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  Please upload a clear and recent photo of yourself. This photo will be used for identification purposes.
                </p>
                <ul className="mt-2 text-sm text-gray-700">
                  <li>Use a 2x2 size photo taken with your mobile device or camera.</li>
                  <li className="text-red-500">A clear, close-up image of your face is required.</li>
                </ul>
              </div>
            </div>
          </>
        )}

        {(applicationType === 'Senior ID' || applicationType === 'PWD ID') && renderSignatureUpload()}

        {applicationType === 'PWD ID' && renderDisabilityInfo()}

        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={() => setIsCancelModalOpen(true)}
            className="bg-green-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={handleNextStep}
            className="bg-green-700 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );

  const renderStep2 = () => (
    <>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-green-800">{applicationType} Application</h1>
        <p className="text-gray-600">Please complete the form below</p>
      </div>

      <div className="flex items-center space-x-4 justify-center mb-8">
        <div className="w-8 h-8 rounded-full bg-green-700 text-white flex items-center justify-center">1</div>
        <div className="h-1 w-16 bg-green-700"></div>
        <div className="w-8 h-8 rounded-full bg-green-700 text-white flex items-center justify-center">2</div>
        <div className="h-1 w-16 bg-green-700"></div>
        <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center">3</div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold">Attach Image of Government IDs</h3>
        <hr className="my-2" />
        <p className="text-sm mb-4">Please upload images of your Identification Cards. Fields marked with an asterisk (*) are required.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {applicationType === 'PWD ID' ? (
            <>
              {renderFileInput('governmentId', 'Government ID')}
              {renderFileInput('medicalCertificate', 'Medical Certificate')}
            </>
          ) : (
            <>
              {[
                { name: 'gsis', label: 'GSIS' },
                { name: 'tin', label: 'TIN' },
                { name: 'sss', label: 'SSS' },
                { name: 'philhealth', label: 'Philhealth' },
              ].map((item, index) => (
                <div key={index}>
                  {renderFileInput(item.name, item.label)}
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      <p className="text-red-600 mt-6 text-sm font-semibold text-center">
        WARNING: DO NOT ATTACH AN INVALID ID AS IT MAY ALSO INVALIDATE THE REGISTRATION.
      </p>
      <hr className="mt-4 border-red-400" />

      <div className="flex flex-col sm:flex-row sm:justify-end items-stretch sm:items-center gap-4 mt-6">
        <button
          type="button"
          onClick={handlePreviousStep}
          className="w-full sm:w-auto px-6 py-2 bg-green-700 hover:bg-gray-400 rounded text-white text-sm"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleNextStep}
          className="w-full sm:w-auto px-6 py-2 bg-green-700 hover:bg-blue-700 text-white rounded text-sm"
        >
          Next
        </button>
      </div>
    </>
  );

    const renderStep3 = () => (
      <>
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-green-800">{applicationType} Application</h1>
          <p className="text-gray-600">Please review your information before submitting</p>
        </div>

        <div className="flex items-center space-x-4 justify-center mb-8">
          <div className="w-8 h-8 rounded-full bg-green-700 text-white flex items-center justify-center">1</div>
          <div className="h-1 w-16 bg-green-700"></div>
          <div className="w-8 h-8 rounded-full bg-green-700 text-white flex items-center justify-center">2</div>
          <div className="h-1 w-16 bg-green-700"></div>
          <div className="w-8 h-8 rounded-full bg-green-700 text-white flex items-center justify-center">3</div>
        </div>

        <p className="text-sm text-gray-700 mb-6">
          Please review the information below. Required items are marked with an asterisk (
          <span className="text-red-600">*</span>).
        </p>

        <h2 className="text-xl font-bold mb-4 bg-green-700 text-white py-2 px-4 rounded">Personal Information</h2>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block">Lastname <span className="text-red-600">*</span></label>
              <div className="w-full p-2 border rounded bg-gray-100">{formData.lastname || '-'}</div>
            </div>
            <div>
              <label className="block">Firstname <span className="text-red-600">*</span></label>
              <div className="w-full p-2 border rounded bg-gray-100">{formData.firstname || '-'}</div>
            </div>
            <div>
              <label className="block">Middlename</label>
              <div className="w-full p-2 border rounded bg-gray-100">{formData.middlename || '-'}</div>
            </div>
            <div>
              <label className="block">Suffix</label>
              <div className="w-full p-2 border rounded bg-gray-100">{formData.suffix || '-'}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block">Birth Date <span className="text-red-600">*</span></label>
              <div className="w-full p-2 border rounded bg-gray-100">{formData.birthdate || '-'}</div>
            </div>
            <div>
              <label className="block">Sex at Birth <span className="text-red-600">*</span></label>
              <div className="w-full p-2 border rounded bg-gray-100">{formData.sex || '-'}</div>
            </div>
            <div>
              <label className="block">Blood Type <span className="text-red-600">*</span></label>
              <div className="w-full p-2 border rounded bg-gray-100">{formData.bloodtype || '-'}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block">Marital Status <span className="text-red-600">*</span></label>
              <div className="w-full p-2 border rounded bg-gray-100">{formData.maritalstatus || '-'}</div>
            </div>
            <div>
              <label className="block">Religion <span className="text-red-600">*</span></label>
              <div className="w-full p-2 border rounded bg-gray-100">{formData.religion || '-'}</div>
            </div>
            <div>
              <label className="block">Contact Number <span className="text-red-600">*</span></label>
              <div className="w-full p-2 border rounded bg-gray-100">{formData.contactnumber || '-'}</div>
            </div>
            <div>
              <label className="block">Email Address <span className="text-red-600">*</span></label>
              <div className="w-full p-2 border rounded bg-gray-100">{formData.email || '-'}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-1">
            <div>
              <label className="block">Address <span className="text-red-600">*</span></label>
              <div className="w-full p-2 border rounded bg-gray-100">{formData.address || '-'}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {applicationType !== 'Pension' && (
              <div>
                <h3 className="text-lg font-semibold">Uploaded Photo</h3>
                <hr className="my-2" />
                {formData.photo ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={URL.createObjectURL(formData.photo)}
                      alt="Upload Preview"
                      className="w-48 h-48 object-cover border rounded mb-4"
                    />
                    <button
                      onClick={() => setViewFile({ type: 'image', url: URL.createObjectURL(formData.photo) })}
                      className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 text-sm"
                    >
                      View Photo
                    </button>
                  </div>
                ) : (
                  <div className="w-48 h-48 border rounded mb-4 flex items-center justify-center bg-gray-100">
                    No photo uploaded
                  </div>
                )}
              </div>
            )}

            {(applicationType === 'Senior ID' || applicationType === 'PWD ID') && (
              <div>
                <h3 className="text-lg font-semibold">Uploaded Signature</h3>
                <hr className="my-2" />
                {formData.signature ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={URL.createObjectURL(formData.signature)}
                      alt="Signature Preview"
                      className="w-48 h-48 object-contain border rounded mb-4"
                    />
                    <button
                      onClick={() => setViewFile({ type: 'image', url: URL.createObjectURL(formData.photo) })}
                      className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 text-sm"
                    >
                      View Photo
                    </button>
                  </div>
                ) : (
                  <div className="w-48 h-48 border rounded mb-4 flex items-center justify-center bg-gray-100">
                    No signature uploaded
                  </div>
                )}
              </div>
            )}
          </div>

          {applicationType === 'PWD ID' && (
          <div>
            <h3 className="text-lg font-semibold">Disability Information</h3>
            <hr className="my-2" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block">Cause of Disability <span className="text-red-600">*</span></label>
                <div className="w-full p-2 border rounded bg-gray-100">{formData.causeOfDisability || '-'}</div>
              </div>
              <div>
                <label className="block">Type of Disability <span className="text-red-600">*</span></label>
                <div className="w-full p-2 border rounded bg-gray-100">{formData.typeOfDisability || '-'}</div>
              </div>
            </div>
          </div>
        )}

        <div>
          <h3 className="text-lg font-semibold">Government IDs</h3>
          <hr className="my-2" />
          <div className="space-y-2">
            {applicationType === 'PWD ID' ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block font-medium text-sm">Government ID <span className="text-red-600">*</span></label>
                    {formData.governmentId ? (
                      <div className="text-sm text-green-700">File uploaded: {formData.governmentId.name}</div>
                    ) : (
                      <div className="text-sm text-gray-500">No file uploaded</div>
                    )}
                  </div>
                  {formData.governmentId && (
                    <button
                      onClick={() => setViewFile({ type: 'image', url: URL.createObjectURL(formData.governmentId) })}
                      className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 text-sm"
                    >
                      View
                    </button>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block font-medium text-sm">Medical Certificate <span className="text-red-600">*</span></label>
                    {formData.medicalCertificate ? (
                      <div className="text-sm text-green-700">File uploaded: {formData.medicalCertificate.name}</div>
                    ) : (
                      <div className="text-sm text-gray-500">No file uploaded</div>
                    )}
                  </div>
                  {formData.medicalCertificate && (
                    <button
                      onClick={() => window.open(URL.createObjectURL(formData.medicalCertificate), '_blank')}
                      className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 text-sm"
                    >
                      View
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                {[
                  { name: 'gsis', label: 'GSIS' },
                  { name: 'tin', label: 'TIN' },
                  { name: 'sss', label: 'SSS' },
                  { name: 'philhealth', label: 'Philhealth' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <label className="block font-medium text-sm">{item.label} {item.name !== 'gsis' && <span className="text-red-600">*</span>}</label>
                      {formData[item.name] ? (
                        <div className="text-sm text-green-700">File uploaded: {formData[item.name].name}</div>
                      ) : (
                        <div className="text-sm text-gray-500">No file uploaded</div>
                      )}
                    </div>
                    {formData[item.name] && (
                      <button
                        onClick={() => setViewFile({ type: 'image', url: URL.createObjectURL(formData[item.name]) })}
                        className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 text-sm"
                      >
                        View
                      </button>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold bg-green-700 text-white text-center py-2">Confirmation to Allow the User to Proceed</h2>
            <div className="space-y-2 mt-4">
              {[
                "The information entered above is true and correct.",
                "I have the full knowledge in providing the above information.",
                "I have personally given my consent to allow the use of the information contained in this form.",
                "I confirm and agree to all of above.",
                "I have certified further that during the filling-out of this form, I was assisted by the person whose name is indicated below and that such person is personally known to me.",
              ].map((text, index) => (
                <label key={index} className="flex items-start">
                  <input
                    type="checkbox"
                    name={`confirmation-${index}`}
                    checked={formData.confirmations[index]}
                    onChange={handleChange}
                    required
                    className="mt-1 mr-2"
                  />
                  <span>{text}</span>
                  {errors[`confirmation-${index}`] && (
                    <p className="text-red-500 text-sm ml-2">{errors[`confirmation-${index}`]}</p>
                  )}
                </label>
              ))}
            </div>

            <h5 className="mt-6 font-semibold">IN CASE OF EMERGENCY PLEASE NOTIFY</h5>
            <hr className="my-2" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium">Emergency Contact Name <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  name="emergencyName"
                  value={formData.emergencyName}
                  onChange={handleChange}
                  required
                  className={`w-full p-2 border rounded ${errors.emergencyName ? 'border-red-500' : ''}`}
                />
                {errors.emergencyName && <p className="text-red-500 text-sm">{errors.emergencyName}</p>}
              </div>
              <div>
                <label className="block font-medium">Emergency Contact No <span className="text-red-600">*</span></label>
                <input
                  type="tel"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  maxLength="11"
                  placeholder="09XXXXXXXXX"
                  required
                  className={`w-full p-2 border rounded ${errors.emergencyContact ? 'border-red-500' : ''}`}
                />
                {errors.emergencyContact && <p className="text-red-500 text-sm">{errors.emergencyContact}</p>}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={handlePreviousStep}
              className="bg-green-700 text-white px-6 py-2 rounded hover:bg-gray-600"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="bg-green-700 text-white px-6 py-2 rounded hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Submit'}
            </button>
          </div>
        </div>
      </>
    );

  return (
    <div className="font-sans min-h-screen flex flex-col bg-green-700 mt-[76px]">
      <div className="p-8 sm:p-12 md:p-16 pt-[140px]">
        <div className="max-w-6xl mx-auto w-full px-4">
          {hasExistingApplication === null ? (
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <p>Checking your application status...</p>
            </div>
          ) : hasExistingApplication ? (
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <p>You cannot access the application form at this time.</p>
            </div>
          ) : (
            <div className="bg-white p-5 rounded-lg shadow-lg">
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
            </div>
          )}
        </div>
      </div>

      {isCancelModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-[rgba(0,0,0,0.5)] backdrop-blur-sm">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Cancel Form</h2>
            <p className="mb-4">Are you sure you want to cancel? All entered data will be lost.</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
              >
                No
              </button>
              <Link
                to="/Application"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                onClick={() => {
                  // Reset formData on cancel
                  setFormData({
                    lastname: '',
                    firstname: '',
                    middlename: '',
                    suffix: '',
                    birthdate: '',
                    sex: '',
                    bloodtype: '',
                    maritalstatus: '',
                    religion: '',
                    contactnumber: '',
                    email: '',
                    address: '',
                    photo: null,
                    signature: null,
                    causeOfDisability: '',
                    typeOfDisability: '',
                    gsis: null,
                    tin: null,
                    sss: null,
                    philhealth: null,
                    governmentId: null,
                    medicalCertificate: null,
                    confirmations: [false, false, false, false, false],
                    emergencyName: '',
                    emergencyContact: ''
                  });
                  setErrors({});
                  setStep(1);
                }}
              >
                Yes, Cancel
              </Link>
            </div>
          </div>
        </div>
      )}

      {isSubmitting && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-[rgba(0,0,0,0.5)] backdrop-blur-sm">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full text-center">
            <h2 className="text-xl font-semibold mb-4">{uploadProgress}</h2>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-green-600 h-4 rounded-full" 
                style={{
                  width: uploadProgress === 'Uploading...' ? '50%' : '100%',
                  transition: 'width 0.5s ease-in-out'
                }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-[rgba(0,0,0,0.5)] backdrop-blur-sm">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full text-center">
            <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h2 className="text-xl font-semibold mt-4 mb-2">Application Submitted Successfully!</h2>
            <p className="mb-4">Please wait 3-5 days to process your application.</p>
            <Link
              to="/Application"
              className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
              onClick={() => {
                setShowSuccessModal(false);
              }}
            >
              OK
            </Link>
          </div>
        </div>
      )}

        {existingAppModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-[rgba(0,0,0,0.5)] backdrop-blur-sm">
            <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
              <h2 className="text-xl font-semibold mb-4">Existing Application</h2>
              <p className="mb-4">You already have a pending or approved application. You cannot submit a new application unless your previous application was rejected.</p>
              <div className="flex justify-end">
                <Link
                  to="/Application"
                  className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded"
                >
                  OK
                </Link>
              </div>
            </div>
          </div>
        )}

      {showErrorModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-[rgba(0,0,0,0.5)] backdrop-blur-sm">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4 text-red-600">Submission Error</h2>
            <p className="mb-4">{errorMessage}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowErrorModal(false)}
                className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View File Modal */}
      {viewFile && viewFile.type === 'image' && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-[rgba(0,0,0,0.5)] backdrop-blur-sm">
          <div className="bg-white p-6 rounded shadow-lg max-w-3xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">View Image</h2>
              <button
                onClick={() => setViewFile(null)}
                className="text-gray-600 hover:text-gray-800"
              >
                ✕
              </button>
            </div>
            <img
              src={viewFile.url}
              alt="Preview"
              className="w-full max-h-[70vh] object-contain"
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setViewFile(null)}
                className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Application_Form;