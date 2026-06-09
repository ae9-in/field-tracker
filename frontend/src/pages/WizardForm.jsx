import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormState } from '../context/FormContext';
import Step1 from '../components/Wizard/Step1';
import Step2 from '../components/Wizard/Step2';
import Step3 from '../components/Wizard/Step3';
import Step4 from '../components/Wizard/Step4';

export default function WizardForm() {
  const { currentStep, setCurrentStep, saveDraft, submitEntry, formData, savingDraft } = useFormState();
  const navigate = useNavigate();

  const totalSteps = 4;

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  const handleNext = async () => {
    // Basic validations per step
    if (currentStep === 1) {
      if (!formData.placeOfWork || !formData.dateOfVisit) {
        alert('Please fill out the place of work and visit date.');
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.shopDetails?.name) {
        alert('Shop Name is required.');
        return;
      }
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSaveDraft = async () => {
    const res = await saveDraft();
    if (res.success) {
      alert('Draft saved successfully!');
    } else {
      alert(res.message || 'Error saving draft.');
    }
  };

  const stepTitles = [
    'Employee & Location Info',
    'Shop Details',
    'Media Uploads',
    'Review & Submit'
  ];

  return (
    <div className="bg-background text-on-background min-h-screen diagonal-stripes flex flex-col pb-32">
      {/* Top App Bar */}
      <header className="bg-surface border-b border-surface-container-high flex justify-between items-center w-full px-container-margin-mobile md:px-container-margin-desktop h-16 fixed top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-surface-container-high rounded-full transition-all active:scale-90 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-primary">arrow_back</span>
          </button>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-primary">
            New Field Entry
          </h1>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1 border border-outline-variant hover:bg-surface-container-high px-3 py-1.5 rounded-lg text-label-sm font-semibold transition-all"
          >
            <span className="material-symbols-outlined text-sm">dashboard</span>
            Dashboard
          </button>
        </div>
      </header>

      <main className="mt-24 px-container-margin-mobile md:px-container-margin-desktop max-w-2xl mx-auto w-full flex-grow">
        {/* Progress Bar Section */}
        <div className="mb-xl">
          <div className="flex justify-between items-end mb-2">
            <p className="font-label-md text-label-md text-primary">
              Step {currentStep} of {totalSteps}
            </p>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              {stepTitles[currentStep - 1]}
            </p>
          </div>
          <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 ease-in-out"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Dynamic Step Rendering */}
        <div className="space-y-xl">
          {currentStep === 1 && <Step1 />}
          {currentStep === 2 && <Step2 />}
          {currentStep === 3 && <Step3 />}
          {currentStep === 4 && <Step4 />}
        </div>
      </main>

      {/* Fixed Bottom Action Bar */}
      {currentStep < 4 && (
        <div className="fixed bottom-0 left-0 right-0 w-full bg-surface border-t border-secondary-fixed p-container-margin-mobile flex gap-4 z-50 justify-center">
          <div className="max-w-2xl w-full flex gap-4">
            <button
              className="flex-1 py-4 border-2 border-primary text-primary rounded-lg font-label-md text-label-md hover:bg-primary-fixed hover:text-primary transition-all active:scale-95 duration-150"
              onClick={handleSaveDraft}
              disabled={savingDraft}
            >
              {savingDraft ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              className="flex-[2] py-4 bg-primary text-white rounded-lg font-label-md text-label-md shadow-lg shadow-primary/20 hover:bg-[#8494FF] transition-all active:scale-95"
              onClick={handleNext}
            >
              Continue to Step {currentStep + 1}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
