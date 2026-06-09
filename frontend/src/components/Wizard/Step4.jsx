import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormState } from '../../context/FormContext';
import { SERVER_URL } from '../../config';

export default function Step4() {
  const { formData, submitEntry, setCurrentStep } = useFormState();
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!confirmed) {
      alert('Please check the confirmation box to submit.');
      return;
    }
    setSubmitting(true);
    const res = await submitEntry();
    if (res.success) {
      alert('Field entry submitted successfully!');
      navigate('/');
    } else {
      alert(res.message || 'Submission failed.');
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-xl animate-fadeIn">
      {/* Bento-style Review Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        {/* Employee Info Card */}
        <section className="bg-white border border-outline-variant p-md rounded-xl diagonal-pattern flex flex-col gap-sm group relative">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-xs text-primary">
              <span className="material-symbols-outlined text-[20px]">badge</span>
              <h2 className="font-label-md text-label-md uppercase tracking-wider">Employee Info</h2>
            </div>
            <button
              onClick={() => setCurrentStep(1)}
              className="text-primary hover:bg-primary-fixed p-1 rounded transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
            </button>
          </div>
          <div className="mt-xs">
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">Full Name</p>
            <p className="font-body-md text-body-md font-bold">{formData.employeeName}</p>
          </div>
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">Employee ID</p>
            <p className="font-body-md text-body-md font-bold">{formData.employeeId}</p>
          </div>
        </section>

        {/* Location Card */}
        <section className="bg-white border border-outline-variant p-md rounded-xl flex flex-col gap-sm group relative">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-xs text-primary">
              <span className="material-symbols-outlined text-[20px]">location_on</span>
              <h2 className="font-label-md text-label-md uppercase tracking-wider">Location</h2>
            </div>
            <button
              onClick={() => setCurrentStep(1)}
              className="text-primary hover:bg-primary-fixed p-1 rounded transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
            </button>
          </div>
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">Place of Work</p>
            <p className="font-body-md text-body-md font-bold">{formData.placeOfWork}</p>
          </div>
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">Coordinates</p>
            <p className="font-body-md text-body-md font-bold">
              {formData.location?.latitude && formData.location?.longitude
                ? `${formData.location.latitude}° N, ${formData.location.longitude}° W`
                : 'GPS Coordinates not captured'}
            </p>
          </div>
        </section>

        {/* Shop Details Card - Span 2 on Desktop */}
        <section className="md:col-span-2 bg-white border border-outline-variant p-md rounded-xl flex flex-col gap-md group">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-xs text-primary">
              <span className="material-symbols-outlined text-[20px]">storefront</span>
              <h2 className="font-label-md text-label-md uppercase tracking-wider">Shop Details</h2>
            </div>
            <button
              onClick={() => setCurrentStep(2)}
              className="text-primary hover:bg-primary-fixed p-1 rounded transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
            <div>
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">Shop Name</p>
              <p className="font-body-md text-body-md font-bold">{formData.shopDetails?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">Owner</p>
              <p className="font-body-md text-body-md font-bold">{formData.shopDetails?.ownerName || 'N/A'}</p>
            </div>
            <div>
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">Category</p>
              <span className="inline-block mt-1 px-2 py-0.5 bg-tertiary-fixed-dim text-on-tertiary-fixed text-label-sm rounded-md capitalize">
                {formData.shopDetails?.category || 'General'}
              </span>
            </div>
            <div>
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">Phone</p>
              <p className="font-body-md text-body-md font-bold">{formData.shopDetails?.phoneNumber ? `+91 ${formData.shopDetails.phoneNumber}` : 'N/A'}</p>
            </div>
          </div>
        </section>

        {/* Media Review Section */}
        <section className="md:col-span-2 bg-white border border-outline-variant p-md rounded-xl flex flex-col gap-md group">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-xs text-primary">
              <span className="material-symbols-outlined text-[20px]">perm_media</span>
              <h2 className="font-label-md text-label-md uppercase tracking-wider">Media & Attachments</h2>
            </div>
            <button
              onClick={() => setCurrentStep(3)}
              className="text-primary hover:bg-primary-fixed p-1 rounded transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
            {/* Image Thumbnails */}
            <div>
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-2">Uploaded Images</p>
              {formData.media?.images?.length > 0 ? (
                <div className="flex gap-md overflow-x-auto pb-2">
                  {formData.media.images.map((url, index) => (
                    <div key={index} className="relative min-w-[120px] h-24 rounded-lg overflow-hidden border border-outline-variant">
                      <img alt={`Upload ${index}`} className="w-full h-full object-cover" src={url?.startsWith('http') ? url : `${SERVER_URL}${url}`} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-on-surface-variant italic">No images uploaded</p>
              )}
            </div>
            
            {/* Audio Notes */}
            <div className="flex flex-col gap-sm">
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-1">Voice Notes</p>
              {formData.media?.employeeVoiceNote ? (
                <div className="bg-surface-container-low p-2 rounded-lg">
                  <p className="text-xs font-bold mb-1">Employee Voice Survey</p>
                  <audio controls src={formData.media.employeeVoiceNote?.startsWith('http') ? formData.media.employeeVoiceNote : `${SERVER_URL}${formData.media.employeeVoiceNote}`} className="w-full h-8" />
                </div>
              ) : (
                <p className="text-xs text-on-surface-variant italic">No employee voice note</p>
              )}

              {formData.media?.shopRepVoiceNote ? (
                <div className="bg-surface-container-low p-2 rounded-lg mt-2">
                  <p className="text-xs font-bold mb-1">Shop Representative Note</p>
                  <audio controls src={formData.media.shopRepVoiceNote?.startsWith('http') ? formData.media.shopRepVoiceNote : `${SERVER_URL}${formData.media.shopRepVoiceNote}`} className="w-full h-8" />
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </div>

      {/* Validation Checkbox */}
      <div className="mt-xl p-md bg-secondary-fixed rounded-xl flex gap-md items-start">
        <input
          className="mt-1 w-5 h-5 rounded text-primary focus:ring-primary border-outline cursor-pointer"
          id="confirm"
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
        />
        <label className="text-label-md text-on-secondary-fixed-variant leading-tight cursor-pointer font-semibold" htmlFor="confirm">
          I confirm that all data entered above is accurate to the best of my knowledge and represents a physical site visit conducted on {formData.dateOfVisit}.
        </label>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-[#6367FF] text-white font-bold py-4 rounded-xl text-body-lg hover:bg-[#4244df] transition-all transform active:scale-[0.98] shadow-lg shadow-primary/20 flex items-center justify-center gap-sm disabled:opacity-70"
        >
          {submitting ? 'Submitting entry...' : 'Submit Field Entry'}
          <span className="material-symbols-outlined">send</span>
        </button>
      </div>
    </div>
  );
}
