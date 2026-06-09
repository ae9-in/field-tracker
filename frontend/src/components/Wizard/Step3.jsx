import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useFormState } from '../../context/FormContext';
import { API_URL } from '../../context/AuthContext';
import { SERVER_URL } from '../../config';

export default function Step3() {
  const { formData, updateFormData } = useFormState();
  const [uploadingImage, setUploadingImage] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState(formData.media?.employeeVoiceNote || '');
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  // File upload helper
  const uploadFile = async (file) => {
    const data = new FormData();
    data.append('mediaFile', file);
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    };
    const res = await axios.post(`${API_URL}/entries/upload`, data, config);
    return res.data.fileUrl;
  };

  // Image Upload handler
  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    setUploadingImage(true);
    try {
      const uploadedUrls = [];
      for (let file of files) {
        const url = await uploadFile(file);
        uploadedUrls.push(url);
      }
      updateFormData({
        media: {
          ...formData.media,
          images: [...(formData.media?.images || []), ...uploadedUrls]
        }
      });
    } catch (err) {
      console.error(err);
      alert('Failed to upload image(s). Make sure you run the server.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Remove image
  const removeImage = (indexToRemove) => {
    updateFormData({
      media: {
        ...formData.media,
        images: formData.media.images.filter((_, idx) => idx !== indexToRemove)
      }
    });
  };

  // Audio recording helpers
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([audioBlob], 'voice-note.webm', { type: 'audio/webm' });
        try {
          const fileUrl = await uploadFile(file);
          setAudioUrl(fileUrl);
          updateFormData({
            media: {
              ...formData.media,
              employeeVoiceNote: fileUrl
            }
          });
        } catch (err) {
          console.error(err);
          alert('Failed to upload recorded voice note.');
        }
      };

      mediaRecorderRef.current.start();
      setRecording(true);
      setRecordTime(0);
      timerRef.current = setInterval(() => {
        setRecordTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied or error:', err);
      alert('Microphone access is required to record voice notes directly.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      // Stop all tracks in the stream to release mic icon
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleAudioUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const url = await uploadFile(file);
      setAudioUrl(url);
      updateFormData({
        media: {
          ...formData.media,
          employeeVoiceNote: url
        }
      });
    } catch (err) {
      console.error(err);
      alert('Audio upload failed.');
    }
  };

  const handleRepAudioUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const url = await uploadFile(file);
      updateFormData({
        media: {
          ...formData.media,
          shopRepVoiceNote: url
        }
      });
      alert('Representative voice note uploaded successfully!');
    } catch (err) {
      console.error(err);
      alert('Audio upload failed.');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-xl animate-fadeIn">
      {/* Left Column: Image Uploads */}
      <div className="bg-white border border-tertiary-fixed-dim rounded-xl p-md shadow-sm">
        <div className="flex items-center justify-between mb-md">
          <label className="font-label-md text-label-md text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">photo_library</span>
            Shop Images
          </label>
          <span className="text-label-sm font-label-sm text-on-surface-variant italic">Max 5 images</span>
        </div>

        {/* File Input */}
        <label className="border-2 border-dashed border-tertiary-fixed-dim rounded-lg p-xl flex flex-col items-center justify-center bg-surface-container-low hover:bg-surface-container-high transition-colors cursor-pointer group mb-md">
          <span className="material-symbols-outlined text-primary text-4xl mb-base group-hover:scale-110 transition-transform">
            cloud_upload
          </span>
          <p className="text-on-surface-variant font-body-md">
            {uploadingImage ? 'Uploading image...' : 'Click or drag images to upload'}
          </p>
          <p className="text-label-sm font-label-sm text-on-surface-variant">PNG, JPG up to 5MB each</p>
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
            disabled={uploadingImage}
          />
        </label>

        {/* Thumbnails */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-md">
          {formData.media?.images?.map((url, index) => (
            <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-outline-variant">
              <img className="w-full h-full object-cover" src={url?.startsWith('http') ? url : `${SERVER_URL}${url}`} alt={`Shop upload ${index + 1}`} />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-on-surface/50 text-white p-1 rounded-full hover:bg-error transition-colors backdrop-blur-md"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          ))}
          {(!formData.media?.images || formData.media.images.length < 3) && (
            <div className="aspect-square rounded-lg border border-dashed border-outline-variant flex items-center justify-center bg-surface-container text-outline-variant">
              <span className="material-symbols-outlined">add_photo_alternate</span>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Voice Notes */}
      <div className="flex flex-col gap-xl">
        {/* Employee Voice Note */}
        <div className="bg-white border border-tertiary-fixed-dim rounded-xl p-md shadow-sm">
          <label className="font-label-md text-label-md text-on-surface flex items-center gap-2 mb-md">
            <span className="material-symbols-outlined text-primary">account_circle</span>
            Employee Voice Note
          </label>

          <div className="bg-surface-container-low rounded-lg p-md">
            <div className="flex flex-col items-center py-md">
              {/* Waveform Mockup during recording */}
              {recording && (
                <div className="flex items-center gap-1 h-12 mb-lg">
                  <div className="waveform-bar w-1.5 bg-primary rounded-full"></div>
                  <div className="waveform-bar w-1.5 bg-primary/60 rounded-full"></div>
                  <div className="waveform-bar w-1.5 bg-primary/85 rounded-full"></div>
                  <div className="waveform-bar w-1.5 bg-primary rounded-full"></div>
                  <div className="waveform-bar w-1.5 bg-primary/40 rounded-full"></div>
                  <div className="waveform-bar w-1.5 bg-primary/90 rounded-full"></div>
                  <div className="waveform-bar w-1.5 bg-primary/70 rounded-full"></div>
                </div>
              )}

              <div className="flex items-center gap-xl justify-center">
                {!recording ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="w-16 h-16 rounded-full bg-error text-white flex items-center justify-center shadow-lg hover:bg-red-700 transition-all active:scale-90 ring-4 ring-error/20"
                  >
                    <span className="material-symbols-outlined text-3xl">mic</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="w-16 h-16 rounded-full bg-slate-700 text-white flex items-center justify-center shadow-lg hover:bg-slate-800 transition-all active:scale-90"
                  >
                    <span className="material-symbols-outlined text-3xl">stop</span>
                  </button>
                )}
              </div>
              <span className="mt-md font-label-md text-error">
                {recording ? `${formatTime(recordTime)} Recording...` : audioUrl ? 'Voice Note Captured ✓' : 'Click Mic to Record'}
              </span>

              {audioUrl && (
                <div className="mt-4 w-full">
                  <audio controls src={audioUrl?.startsWith('http') ? audioUrl : `${SERVER_URL}${audioUrl}`} className="w-full" />
                </div>
              )}

              {/* Upload fallback */}
              <div className="mt-4 w-full text-center">
                <p className="text-[11px] text-on-surface-variant mb-2">OR upload audio file:</p>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  className="text-xs text-on-surface-variant border border-outline-variant p-2 rounded-lg bg-white w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Shop Rep Voice Note */}
        <div className="bg-white border border-tertiary-fixed-dim rounded-xl p-md shadow-sm">
          <div className="flex justify-between items-center mb-md">
            <label className="font-label-md text-label-md text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">storefront</span>
              Shop Representative Note
            </label>
            <span className="text-label-sm font-label-sm px-2 py-0.5 bg-tertiary-fixed-dim/30 text-on-surface rounded-full">
              Optional
            </span>
          </div>

          <label className="border-2 border-dashed border-outline-variant rounded-lg p-lg flex flex-col items-center justify-center bg-surface-container-low hover:bg-surface-container-high transition-colors cursor-pointer group">
            <span className="material-symbols-outlined text-on-surface-variant text-4xl mb-base">upload_file</span>
            <p className="font-body-md text-body-md font-semibold text-on-surface">
              {formData.media?.shopRepVoiceNote ? 'Note Attached ✓' : 'Click to upload voice file'}
            </p>
            <p className="text-label-sm font-label-sm text-on-surface-variant">MP3, WAV, M4A up to 20MB</p>
            <input
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleRepAudioUpload}
            />
          </label>
          {formData.media?.shopRepVoiceNote && (
            <div className="mt-4 w-full">
              <audio controls src={formData.media.shopRepVoiceNote?.startsWith('http') ? formData.media.shopRepVoiceNote : `${SERVER_URL}${formData.media.shopRepVoiceNote}`} className="w-full" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
