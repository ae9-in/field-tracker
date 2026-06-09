import React from 'react';
import { useFormState } from '../../context/FormContext';

export default function Step2() {
  const { formData, updateFormData } = useFormState();

  const handleChange = (field, value) => {
    updateFormData({
      shopDetails: {
        ...formData.shopDetails,
        [field]: value
      }
    });
  };

  return (
    <section className="space-y-lg animate-fadeIn">
      <div className="space-y-4">
        <div className="space-y-1">
          <label className="font-label-md text-label-md text-on-surface">Shop Name *</label>
          <input
            className="w-full bg-white border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg font-body-md text-body-md px-4 py-3 outline-none transition-all"
            placeholder="Full registered name"
            required
            type="text"
            value={formData.shopDetails?.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="font-label-md text-label-md text-on-surface">Owner Name</label>
          <input
            className="w-full bg-white border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg font-body-md text-body-md px-4 py-3 outline-none transition-all"
            placeholder="Contact person name"
            type="text"
            value={formData.shopDetails?.ownerName || ''}
            onChange={(e) => handleChange('ownerName', e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="font-label-md text-label-md text-on-surface">Shop Address</label>
          <textarea
            className="w-full bg-white border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg font-body-md text-body-md px-4 py-3 outline-none transition-all resize-none"
            placeholder="Full street address, landmark"
            rows="3"
            value={formData.shopDetails?.address || ''}
            onChange={(e) => handleChange('address', e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="font-label-md text-label-md text-on-surface">Phone Number</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-body-md">+91</span>
            <input
              className="w-full bg-white border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg font-body-md text-body-md pl-14 pr-4 py-3 outline-none transition-all"
              placeholder="98765 43210"
              type="tel"
              value={formData.shopDetails?.phoneNumber || ''}
              onChange={(e) => handleChange('phoneNumber', e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="font-label-md text-label-md text-on-surface">Category</label>
          <select
            className="w-full bg-white border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg font-body-md text-body-md px-4 py-3 outline-none transition-all appearance-none"
            value={formData.shopDetails?.category || ''}
            onChange={(e) => handleChange('category', e.target.value)}
          >
            <option value="">Select Category</option>
            <option value="retail">Retail Pharmacy</option>
            <option value="wholesale">Wholesale Distributor</option>
            <option value="clinic">Medical Clinic</option>
            <option value="hospital">Hospital Supply</option>
          </select>
        </div>
      </div>
    </section>
  );
}
