import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL, useAuth } from './AuthContext';

const FormContext = createContext(null);

const initialFormState = {
  employeeName: '',
  employeeId: '',
  placeOfWork: '',
  dateOfVisit: new Date().toISOString().split('T')[0],
  location: {
    latitude: '',
    longitude: ''
  },
  shopDetails: {
    name: '',
    ownerName: '',
    address: '',
    phoneNumber: '',
    category: ''
  },
  media: {
    images: [],
    employeeVoiceNote: '',
    shopRepVoiceNote: ''
  }
};

export const FormProvider = ({ children }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState(initialFormState);
  const [currentStep, setCurrentStep] = useState(1);
  const [entryId, setEntryId] = useState(null);
  const [savingDraft, setSavingDraft] = useState(false);

  // Prefill employee details on user login
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        employeeName: user.name,
        employeeId: user.employeeId
      }));
    } else {
      resetForm();
    }
  }, [user]);

  const resetForm = () => {
    setFormData({
      ...initialFormState,
      employeeName: user?.name || '',
      employeeId: user?.employeeId || ''
    });
    setCurrentStep(1);
    setEntryId(null);
  };

  const updateFormData = (stepData) => {
    setFormData(prev => {
      const updated = { ...prev };
      if (stepData.employeeName !== undefined) updated.employeeName = stepData.employeeName;
      if (stepData.employeeId !== undefined) updated.employeeId = stepData.employeeId;
      if (stepData.placeOfWork !== undefined) updated.placeOfWork = stepData.placeOfWork;
      if (stepData.dateOfVisit !== undefined) updated.dateOfVisit = stepData.dateOfVisit;
      if (stepData.location !== undefined) {
        updated.location = { ...updated.location, ...stepData.location };
      }
      if (stepData.shopDetails !== undefined) {
        updated.shopDetails = { ...updated.shopDetails, ...stepData.shopDetails };
      }
      if (stepData.media !== undefined) {
        updated.media = { ...updated.media, ...stepData.media };
      }
      return updated;
    });
  };

  const saveDraft = async () => {
    if (!user) return;
    setSavingDraft(true);
    try {
      const payload = {
        employeeName: formData.employeeName,
        employeeId: formData.employeeId,
        placeOfWork: formData.placeOfWork || 'Unnamed Draft Location',
        dateOfVisit: formData.dateOfVisit,
        location: {
          latitude: Number(formData.location.latitude) || 0,
          longitude: Number(formData.location.longitude) || 0
        },
        shopDetails: formData.shopDetails,
        media: formData.media,
        status: 'Draft'
      };

      let res;
      if (entryId) {
        res = await axios.put(`${API_URL}/entries/${entryId}`, payload);
      } else {
        res = await axios.post(`${API_URL}/entries`, payload);
        setEntryId(res.data._id);
      }
      setSavingDraft(false);
      return { success: true, entry: res.data };
    } catch (error) {
      console.error('Draft save failed:', error);
      setSavingDraft(false);
      return { success: false, message: error.response?.data?.message || 'Failed to save draft' };
    }
  };

  const submitEntry = async () => {
    if (!user) return;
    try {
      const payload = {
        employeeName: formData.employeeName,
        employeeId: formData.employeeId,
        placeOfWork: formData.placeOfWork,
        dateOfVisit: formData.dateOfVisit,
        location: {
          latitude: Number(formData.location.latitude) || 0,
          longitude: Number(formData.location.longitude) || 0
        },
        shopDetails: formData.shopDetails,
        media: formData.media,
        status: 'Submitted'
      };

      let res;
      if (entryId) {
        res = await axios.put(`${API_URL}/entries/${entryId}`, payload);
      } else {
        res = await axios.post(`${API_URL}/entries`, payload);
      }
      resetForm();
      return { success: true, entry: res.data };
    } catch (error) {
      console.error('Final entry submit failed:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to submit entry' };
    }
  };

  const loadDraft = (entry) => {
    setEntryId(entry._id);
    setFormData({
      employeeName: entry.employeeName || '',
      employeeId: entry.employeeId || '',
      placeOfWork: entry.placeOfWork || '',
      dateOfVisit: entry.dateOfVisit ? entry.dateOfVisit.split('T')[0] : new Date().toISOString().split('T')[0],
      location: {
        latitude: entry.location?.latitude || '',
        longitude: entry.location?.longitude || ''
      },
      shopDetails: {
        name: entry.shopDetails?.name || '',
        ownerName: entry.shopDetails?.ownerName || '',
        address: entry.shopDetails?.address || '',
        phoneNumber: entry.shopDetails?.phoneNumber || '',
        category: entry.shopDetails?.category || ''
      },
      media: {
        images: entry.media?.images || [],
        employeeVoiceNote: entry.media?.employeeVoiceNote || '',
        shopRepVoiceNote: entry.media?.shopRepVoiceNote || ''
      }
    });
    setCurrentStep(1);
  };

  return (
    <FormContext.Provider value={{
      formData,
      currentStep,
      setCurrentStep,
      entryId,
      setEntryId,
      updateFormData,
      saveDraft,
      submitEntry,
      loadDraft,
      resetForm,
      savingDraft
    }}>
      {children}
    </FormContext.Provider>
  );
};

export const useFormState = () => useContext(FormContext);
