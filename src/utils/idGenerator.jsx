import domtoimage from "dom-to-image-more";
import sabang from "../../src/assets/logo.png";
import etivac from "../../src/assets/cavite.jpg";


export async function generateIDCard(data) {
  // Create a temporary div to render the ID card
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.width = '900px';
  tempDiv.style.backgroundColor = '#fff';
  tempDiv.style.padding = '20px';
  tempDiv.style.borderRadius = '8px';
  
  // Add CSS to remove all unwanted borders
  const style = document.createElement('style');
  style.textContent = `
    * {
      border: none !important;
      outline: none !important;
    }
    u {
      text-decoration: none;
      border-bottom: 1px solid #000 !important;
    }
    .rounded {
      border: 1px solid #d1d5db !important;
    }
  `;
  tempDiv.appendChild(style);

  // Generate the ID card HTML (same structure as original)
  tempDiv.innerHTML += `
    <div class="flex justify-between items-center text-center">
      <div class="p-6 flex-shrink-0">
        <img src="${sabang}" alt="Barangay Logo" class="w-20 max-w-full h-auto" />
      </div>

      <div class="flex-1 px-2">
        <h2 class="text-base font-semibold">REPUBLIC OF THE PHILIPPINES</h2>
        <h1 class="text-base">PROVINCE OF CAVITE CITY OF DASMARIÑAS</h1>
        <h3 class="text-base font-medium">OFFICE OF THE SENIOR CITIZENS AFFAIRS (OSCA)</h3>
        <h2 class="text-base font-medium text-green-800">BARANGAY SABANG</h2>
      </div>

      <div class="p-6 flex-shrink-0">
        <img src="${etivac}" alt="Etivac Logo" class="w-20 max-w-full h-auto" />
      </div>
    </div>

    <div class="text-center mb-8">
      <div class="text-center bg-green-700 text-white py-2 rounded-lg mb-4 tracking-wide">
        <h3 class="text-xl font-bold text-white tracking-[0.4em]">
          SENIOR CITIZEN IDENTIFICATION CARD
        </h3>
      </div>
    </div>

    <div class="flex flex-col md:flex-row gap-2 items-start">
      <div class="flex flex-col items-center space-y-3 w-full md:w-1/3 flex-shrink-0 self-start">
        <img src="${data.id_img || '/path/to/default-profile.png'}" alt="Profile" class="w-32 h-32 object-cover rounded" />
        <p class="text-sm font-medium">CTRL NO. <u>${data.Control_Number || '-'}</u></p>
        <div class="text-center">
          <img src="${data.signature || '-'}" alt="signature" class="h-12 mx-auto mb-1"/>
          <p class="text-sm font-semibold mt-1">SIGNATURE</p>
        </div>
      </div>

      <div class="flex flex-col w-full md:w-2/3 space-y-4 self-start">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p class="text-xs font-semibold text-black-600">Last Name</p>
            <p class="text-xl font-medium">${data.lname || '-'}</p>
          </div>
          <div>
            <p class="text-xs font-semibold text-black-600">Given Name</p>
            <p class="text-xl font-medium">${data.fname || '-'}</p>
          </div>
          <div>
            <p class="text-xs font-semibold text-black-600">Middle Name</p>
            <p class="text-xl font-medium">${data.mname || '-'}</p>
          </div>
          <div>
            <p class="text-xs font-semibold text-black-600">Suffix</p>
            <p class="text-xl font-medium">${data.extension_name || '-'}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p class="text-xs font-semibold text-black-600">Date of Birth</p>
            <p class="text-xl font-medium">${data.bday || '-'}</p>
          </div>
          <div>
            <p class="text-xs font-semibold text-black-600">Civil Status</p>
            <p class="text-xl font-medium">${data.civil_status || '-'}</p>
          </div>
          <div>
            <p class="text-xs font-semibold text-black-600">Gender</p>
            <p class="text-xl font-medium">${data.sex || '-'}</p>
          </div>
          <div>
            <p class="text-xs font-semibold text-black-600">Blood Type</p>
            <p class="text-xl font-medium">${data.blood_type || '-'}</p>
          </div>
        </div>

        <div>
          <p class="text-xs font-semibold text-black-600 text-left">Address</p>
          <p class="text-xl font-medium text-left">${data.address || '-'}</p>
        </div>
      </div>
    </div>
  `;

 document.body.appendChild(tempDiv);

  try {
    // Add debug logging for image states
    console.log('Image states before loading:');
    Array.from(tempDiv.querySelectorAll('img')).forEach(img => {
      console.log(img.src, {
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight
      });
    });

    // WAIT FOR IMAGES TO LOAD - THIS IS THE CRUCIAL MISSING STEP
    await new Promise(resolve => setTimeout(resolve, 50)); // Small delay to allow DOM to settle
    await loadImages(tempDiv); // Wait for all images to load or fail

    // Debug after loading
    console.log('Image states after loading:');
    Array.from(tempDiv.querySelectorAll('img')).forEach(img => {
      console.log(img.src, {
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight
      });
    });

    // Generate the image
    const dataUrl = await domtoimage.toPng(tempDiv, {
      bgcolor: "#fff",
      cacheBust: true,
      quality: 1 // Ensure highest quality
    });

    document.body.removeChild(tempDiv);
    return dataUrl;
  } catch (error) {
    document.body.removeChild(tempDiv);
    console.error("Error generating ID card:", error);
    throw error;
  }
}

// Modified loadImages function to accept the container element
async function loadImages(container) {
  const images = container.querySelectorAll('img');
  return Promise.all(Array.from(images).map(img => {
    return new Promise((resolve) => {
      if (img.complete && img.naturalWidth !== 0) {
        resolve();
      } else {
        img.onload = () => {
          console.log(`Image loaded: ${img.src}`);
          resolve();
        };
        img.onerror = (e) => {
          console.error(`Image failed to load: ${img.src}`, e);
          resolve(); // Continue anyway
        };
      }
    });
  }));
}