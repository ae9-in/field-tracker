import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth, API_URL } from '../context/AuthContext';
import { useFormState } from '../context/FormContext';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { loadDraft, resetForm } = useFormState();
  const [entries, setEntries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Helper for timezone-safe local date string (YYYY-MM-DD)
  const getLocalDateString = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Date filtering states
  const [filterDate, setFilterDate] = useState(getLocalDateString());
  const [checklistTab, setChecklistTab] = useState('all'); // 'all', 'submitted', 'not_submitted'

  const handlePrevDay = () => {
    const parts = filterDate.split('-');
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    d.setDate(d.getDate() - 1);
    setFilterDate(getLocalDateString(d));
  };

  const handleNextDay = () => {
    const parts = filterDate.split('-');
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    d.setDate(d.getDate() + 1);
    setFilterDate(getLocalDateString(d));
  };

  // Modal states
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  
  // Register employee form state
  const [newUserData, setNewUserData] = useState({
    name: '',
    employeeId: '',
    email: '',
    password: '',
    role: 'agent'
  });
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [registering, setRegistering] = useState(false);

  // Real-time counter states
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    pending: 0,
    activeEmployees: 0
  });

  const navigate = useNavigate();

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API_URL}/auth/employees`);
      setEmployees(res.data);
    } catch (err) {
      console.error('Failed to fetch standard employees list', err);
    }
  };

  const fetchEntries = async () => {
    try {
      const res = await axios.get(`${API_URL}/entries`);
      const data = res.data;
      setEntries(data);

      // Calculate statistics dynamically
      const todayStr = new Date().toISOString().split('T')[0];
      const todayCount = data.filter(e => e.dateOfVisit && e.dateOfVisit.split('T')[0] === todayStr).length;
      const pendingCount = data.filter(e => e.status === 'Draft').length;
      
      const uniqueEmployees = new Set(
        data.map(e => e.employee?._id || e.employee || '')
      );
      const employeesCount = Math.max(uniqueEmployees.size, 1);

      setStats({
        total: data.length,
        today: todayCount,
        pending: pendingCount,
        activeEmployees: employeesCount
      });

      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch admin entries', err);
      setError('Failed to fetch admin data. Make sure you are logged in as an admin.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
    fetchEmployees();
  }, []);

  const handleStartNew = () => {
    resetForm();
    navigate('/entry');
  };

  const handleEditDraft = (entry) => {
    loadDraft(entry);
    navigate('/entry');
  };

  // Register user API submit
  const handleRegisterUser = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');
    setRegistering(true);

    try {
      await axios.post(`${API_URL}/auth/register`, newUserData);
      setRegisterSuccess(`Account created successfully for ${newUserData.name}!`);
      setNewUserData({
        name: '',
        employeeId: '',
        email: '',
        password: '',
        role: 'agent'
      });
      // Refresh list
      fetchEntries();
      fetchEmployees();
    } catch (err) {
      console.error('Registration failed:', err);
      setRegisterError(err.response?.data?.message || 'Failed to create account.');
    } finally {
      setRegistering(false);
    }
  };

  // Generate 7 Days Submissions Chart Heights dynamically
  const getChartData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = [0, 0, 0, 0, 0, 0, 0];
    
    entries.forEach(e => {
      if (e.status === 'Submitted') {
        const dayIdx = new Date(e.dateOfVisit).getDay();
        counts[dayIdx]++;
      }
    });

    const maxCount = Math.max(...counts, 1);
    return days.map((day, idx) => ({
      name: day,
      count: counts[idx],
      height: `${Math.max(10, (counts[idx] / maxCount) * 80)}%`
    }));
  };

  // Calculate status dashboard ratios
  const getStatusRatios = () => {
    const total = entries.length || 1;
    const submitted = entries.filter(e => e.status === 'Submitted').length;
    const drafts = entries.filter(e => e.status === 'Draft').length;
    
    const submittedPct = Math.round((submitted / total) * 100);
    const draftsPct = Math.round((drafts / total) * 100);
    
    return {
      submitted: submittedPct,
      drafts: draftsPct
    };
  };

  const chartData = getChartData();
  const ratios = getStatusRatios();

  // Filter employee submission status by date
  const getEmployeeSubmissionsForDate = () => {
    return employees.map(emp => {
      // Find standard entry on selected date (prioritize Submitted, fall back to Draft if both exist)
      const matchedEntries = entries.filter(entry => {
        const entryDate = entry.dateOfVisit ? entry.dateOfVisit.split('T')[0] : '';
        const matchEmployee = (entry.employee?._id || entry.employee) === emp._id;
        return matchEmployee && entryDate === filterDate;
      });

      const submittedMatch = matchedEntries.find(e => e.status === 'Submitted');
      const draftMatch = matchedEntries.find(e => e.status === 'Draft');
      const match = submittedMatch || draftMatch || null;

      return {
        employee: emp,
        status: match ? match.status : 'None',
        entry: match
      };
    });
  };

  const submissionStatuses = getEmployeeSubmissionsForDate();

  return (
    <div className="bg-background text-on-surface min-h-screen font-body-md overflow-x-hidden relative">
      {/* Navigation Drawer Overlay */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
          onClick={() => setIsDrawerOpen(false)}
        ></div>
      )}

      {/* Navigation Drawer */}
      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-surface dark:bg-surface-container z-[70] border-r border-outline-variant dark:border-outline flex flex-col p-md transition-transform duration-300 ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex flex-col gap-xs mb-xl">
          <div className="flex items-center gap-md mb-md">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary">
              <span className="material-symbols-outlined text-primary text-4xl flex items-center justify-center h-full bg-primary-fixed">
                admin_panel_settings
              </span>
            </div>
            <div>
              <h3 className="font-headline-md text-headline-md text-primary truncate w-44">{user?.name || 'Admin'}</h3>
              <p className="font-label-sm text-label-sm text-on-surface-variant">System Administrator</p>
            </div>
          </div>
        </div>

        {/* Drawer Links */}
        <nav className="flex-1 flex flex-col gap-xs">
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="w-full text-left bg-secondary-container text-on-secondary-container rounded-lg font-bold flex items-center gap-md p-md transition-all active:scale-95 duration-200"
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-label-md text-label-md">Dashboard</span>
          </button>
          
          <button
            onClick={() => {
              setIsDrawerOpen(false);
              setShowCreateUserModal(true);
            }}
            className="w-full text-left text-on-surface-variant hover:bg-surface-container-high rounded-lg flex items-center gap-md p-md transition-all active:scale-95 duration-200"
          >
            <span className="material-symbols-outlined">person_add</span>
            <span className="font-label-md text-label-md">Create Employee</span>
          </button>

          <button
            onClick={handleStartNew}
            className="w-full text-left text-on-surface-variant hover:bg-surface-container-high rounded-lg flex items-center gap-md p-md transition-all active:scale-95 duration-200"
          >
            <span className="material-symbols-outlined">add_circle</span>
            <span className="font-label-md text-label-md">New Field Entry</span>
          </button>

          <button
            onClick={logout}
            className="w-full text-left text-on-surface-variant hover:bg-surface-container-high rounded-lg flex items-center gap-md p-md transition-all active:scale-95 duration-200 mt-auto"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-md text-label-md">Logout Session</span>
          </button>
        </nav>
      </aside>

      {/* Top App Bar */}
      <header className="fixed top-0 left-0 w-full z-50 bg-surface dark:bg-surface-container-low h-16 flex justify-between items-center px-container-margin-mobile md:px-container-margin-desktop border-b border-outline-variant shadow-sm">
        <div className="flex items-center gap-md">
          <button
            className="text-primary dark:text-inverse-primary hover:text-primary-container transition-colors p-2 active:opacity-80 duration-150"
            onClick={() => setIsDrawerOpen(true)}
          >
            <span className="material-symbols-outlined text-3xl">menu</span>
          </button>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-primary dark:text-inverse-primary">
            FieldTrack Admin
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateUserModal(true)}
            className="bg-primary hover:bg-[#8494FF] text-white px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 active:scale-95 shadow"
          >
            <span className="material-symbols-outlined text-sm">person_add</span>
            Create Employee
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pt-24 pb-24 px-container-margin-mobile max-w-[1280px] mx-auto w-full">
        {/* Welcome Section with Pattern */}
        <section className="mb-xl rounded-xl diagonal-stripes bg-primary-fixed/20 p-xl border border-outline-variant">
          <h2 className="font-headline-md text-headline-md text-on-primary-fixed mb-xs">Welcome Back, {user?.name || 'Administrator'}</h2>
          <p className="text-on-surface-variant font-body-md">
            System diagnostics: Database connected. Real-time logging console operational.
          </p>
        </section>

        {error && (
          <div className="p-md bg-error-container text-on-error-container border border-error/20 rounded-xl mb-xl flex items-center gap-2">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span className="material-symbols-outlined text-primary text-4xl animate-spin">sync</span>
            <p className="text-on-surface-variant text-label-md">Syncing telemetry data...</p>
          </div>
        ) : (
          <>
            {/* Stats Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-md mb-xl">
              {/* Card 1 */}
              <div className="bg-white border border-tertiary-fixed-dim p-md rounded-xl flex flex-col gap-xs relative overflow-hidden shadow-sm">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Total Field Entries</span>
                <span className="font-display-lg text-headline-md lg:text-display-lg text-primary font-bold">
                  {stats.total}
                </span>
                <span className="absolute -right-2 -bottom-2 opacity-10 text-primary">
                  <span className="material-symbols-outlined text-6xl">inventory_2</span>
                </span>
              </div>
              {/* Card 2 */}
              <div className="bg-white border border-tertiary-fixed-dim p-md rounded-xl flex flex-col gap-xs relative overflow-hidden shadow-sm">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Entries Today</span>
                <span className="font-display-lg text-headline-md lg:text-display-lg text-primary font-bold">
                  {stats.today}
                </span>
                <span className="absolute -right-2 -bottom-2 opacity-10 text-primary">
                  <span className="material-symbols-outlined text-6xl">today</span>
                </span>
              </div>
              {/* Card 3 */}
              <div className="bg-white border border-tertiary-fixed-dim p-md rounded-xl flex flex-col gap-xs relative overflow-hidden shadow-sm">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Active Drafts</span>
                <span className="font-display-lg text-headline-md lg:text-display-lg text-amber-600 font-bold">
                  {stats.pending}
                </span>
                <span className="absolute -right-2 -bottom-2 opacity-10 text-amber-600">
                  <span className="material-symbols-outlined text-6xl">pending_actions</span>
                </span>
              </div>
              {/* Card 4 */}
              <div className="bg-white border border-tertiary-fixed-dim p-md rounded-xl flex flex-col gap-xs relative overflow-hidden shadow-sm">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Active Employees</span>
                <span className="font-display-lg text-headline-md lg:text-display-lg text-primary font-bold">
                  {stats.activeEmployees}
                </span>
                <span className="absolute -right-2 -bottom-2 opacity-10 text-primary">
                  <span className="material-symbols-outlined text-6xl">badge</span>
                </span>
              </div>
            </div>

            {/* Charts Layout (Bento Style) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-md mb-xl">
              {/* Bar Chart: Submissions per day */}
              <div className="lg:col-span-2 bg-white border border-tertiary-fixed-dim rounded-xl p-md shadow-sm">
                <div className="flex justify-between items-center mb-xl">
                  <h3 className="font-label-md text-label-md text-on-surface font-bold">Submissions per day (Weekly view)</h3>
                  <span className="material-symbols-outlined text-on-surface-variant">bar_chart</span>
                </div>
                <div className="h-48 flex items-end justify-between gap-base px-base">
                  {chartData.map((data, idx) => (
                    <div
                      key={idx}
                      className="flex-1 bg-primary/20 rounded-t-lg relative group transition-all hover:bg-primary"
                      style={{ height: data.height }}
                    >
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-[10px] bg-primary text-white px-2 py-0.5 rounded shadow transition-opacity z-10 font-bold">
                        {data.count}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-on-surface-variant mt-xs font-label-sm">
                  {chartData.map((d, i) => (
                    <span key={i} className="flex-1 text-center">{d.name}</span>
                  ))}
                </div>
              </div>

              {/* Pie Chart: Status Breakdown */}
              <div className="bg-white border border-tertiary-fixed-dim rounded-xl p-md flex flex-col shadow-sm">
                <h3 className="font-label-md text-label-md text-on-surface mb-xl font-bold font-headline-md">Submission Ratio</h3>
                <div className="flex-1 flex items-center justify-center relative">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" fill="transparent" r="16" stroke="#efecf9" stroke-width="4"></circle>
                    <circle
                      cx="18"
                      cy="18"
                      fill="transparent"
                      r="16"
                      stroke="#4244df"
                      strokeDasharray={`${ratios.submitted} 100`}
                      strokeWidth="4"
                    ></circle>
                    <circle
                      cx="18"
                      cy="18"
                      fill="transparent"
                      r="16"
                      stroke="#f59e0b"
                      strokeDasharray={`${ratios.drafts} 100`}
                      strokeDashoffset={`-${ratios.submitted}`}
                      strokeWidth="4"
                    ></circle>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-headline-md font-bold text-primary">{ratios.submitted}%</span>
                    <span className="text-[10px] text-on-surface-variant">Submitted Ratio</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-md mt-md justify-center">
                  <div className="flex items-center gap-xs">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <span className="text-[10px] font-medium">Submitted ({ratios.submitted}%)</span>
                  </div>
                  <div className="flex items-center gap-xs">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span className="text-[10px] font-medium">Draft ({ratios.drafts}%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* TWO-COLUMN LAYOUT: DATE TRACKING & REAL-TIME ACTIVITY STREAM */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl mb-xl">
              {/* DATE PICKER SUBMISSION CHECKLIST */}
              <section className="bg-white border border-tertiary-fixed-dim rounded-xl overflow-hidden shadow-sm flex flex-col">
                {/* Redesigned Card Header with Date Nav */}
                <div className="p-md border-b border-tertiary-fixed-dim flex flex-col sm:flex-row sm:items-center justify-between gap-md bg-surface-container-low">
                  <h3 className="font-headline-md text-label-md text-on-surface font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-primary text-xl">event_available</span>
                    Daily Checklist
                  </h3>
                  
                  <div className="flex items-center gap-sm">
                    <button 
                      onClick={handlePrevDay} 
                      className="p-1 hover:bg-surface-container rounded-full text-primary transition-all flex items-center justify-center"
                      title="Previous Day"
                    >
                      <span className="material-symbols-outlined text-lg">chevron_left</span>
                    </button>
                    <div className="relative flex items-center">
                      <input
                        type="date"
                        className="absolute inset-0 opacity-0 cursor-pointer w-full"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                      />
                      <span className="font-label-md text-primary font-bold hover:underline cursor-pointer flex items-center gap-xs">
                        <span className="material-symbols-outlined text-sm">calendar_month</span>
                        {(() => {
                          const parts = filterDate.split('-');
                          const d = new Date(parts[0], parts[1] - 1, parts[2]);
                          return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
                        })()}
                      </span>
                    </div>
                    <button 
                      onClick={handleNextDay} 
                      className="p-1 hover:bg-surface-container rounded-full text-primary transition-all flex items-center justify-center"
                      title="Next Day"
                    >
                      <span className="material-symbols-outlined text-lg">chevron_right</span>
                    </button>
                  </div>
                </div>

                {/* Progress bar / Submission Stats for Selected Date */}
                {(() => {
                  const total = submissionStatuses.length;
                  const submittedCount = submissionStatuses.filter(item => item.status === 'Submitted').length;
                  const notSubmittedCount = total - submittedCount;
                  const progressPct = total > 0 ? Math.round((submittedCount / total) * 100) : 0;

                  const filteredStatuses = submissionStatuses.filter(item => {
                    if (checklistTab === 'submitted') return item.status === 'Submitted';
                    if (checklistTab === 'not_submitted') return item.status === 'None' || item.status === 'Draft';
                    return true;
                  });

                  return (
                    <>
                      <div className="px-md py-sm bg-surface-container-low/50 border-b border-tertiary-fixed-dim flex items-center justify-between gap-md">
                        <span className="text-xs text-on-surface-variant font-medium">
                          {submittedCount} of {total} employees submitted ({progressPct}%)
                        </span>
                        <div className="w-1/3 bg-surface-container-high h-2 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Checklist Tabs */}
                      <div className="flex border-b border-tertiary-fixed-dim bg-white text-xs font-semibold">
                        <button
                          onClick={() => setChecklistTab('all')}
                          className={`flex-1 py-2 text-center border-b-2 transition-all ${
                            checklistTab === 'all' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-on-surface-variant hover:bg-surface-container-low'
                          }`}
                        >
                          All ({total})
                        </button>
                        <button
                          onClick={() => setChecklistTab('submitted')}
                          className={`flex-1 py-2 text-center border-b-2 transition-all ${
                            checklistTab === 'submitted' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-on-surface-variant hover:bg-surface-container-low'
                          }`}
                        >
                          Submitted ({submittedCount})
                        </button>
                        <button
                          onClick={() => setChecklistTab('not_submitted')}
                          className={`flex-1 py-2 text-center border-b-2 transition-all ${
                            checklistTab === 'not_submitted' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-on-surface-variant hover:bg-surface-container-low'
                          }`}
                        >
                          Not Submitted ({notSubmittedCount})
                        </button>
                      </div>

                      {/* Checklist Items list */}
                      <div className="divide-y divide-tertiary-fixed-dim overflow-y-auto max-h-[450px]">
                        {filteredStatuses.length === 0 ? (
                          <p className="p-md text-on-surface-variant italic text-center">No matching employees for this status.</p>
                        ) : (
                          filteredStatuses.map(({ employee: emp, status, entry }) => (
                            <div key={emp._id} className="p-md flex items-center justify-between hover:bg-surface-container-low/20 transition-all">
                              <div>
                                <h4 className="font-label-md text-on-surface font-bold flex items-center gap-xs">
                                  {emp.name}
                                  {status === 'Draft' && (
                                    <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Draft</span>
                                  )}
                                </h4>
                                <p className="text-xs text-on-surface-variant font-mono">{emp.employeeId || 'ID: Not set'}</p>
                                {entry && entry.placeOfWork && (
                                  <p className="text-[11px] text-primary-container font-semibold mt-0.5 flex items-center gap-0.5">
                                    <span className="material-symbols-outlined text-[12px]">location_on</span>
                                    {entry.placeOfWork}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-md">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  status === 'Submitted'
                                    ? 'bg-green-100 text-green-800'
                                    : status === 'Draft'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {status === 'None' ? 'Not Submitted' : status}
                                </span>
                                {entry && (
                                  <button
                                    onClick={() => setSelectedEntry(entry)}
                                    className="text-xs text-primary font-bold hover:underline"
                                  >
                                    View Work
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  );
                })()}
              </section>

              {/* REAL-TIME ACTIVITY STREAM */}
              <section className="bg-white border border-tertiary-fixed-dim rounded-xl overflow-hidden shadow-sm flex flex-col">
                <div className="p-md border-b border-tertiary-fixed-dim flex justify-between items-center bg-surface-container-low">
                  <h3 className="font-headline-md text-label-md text-on-surface font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-primary text-xl">list_alt</span>
                    Recent Activity
                  </h3>
                  <span className="text-xs text-on-surface-variant italic">Live Feed</span>
                </div>
                
                <div className="divide-y divide-tertiary-fixed-dim overflow-y-auto max-h-[450px]">
                  {entries.length === 0 ? (
                    <p className="p-md text-on-surface-variant italic text-center">No field submissions registered in database yet.</p>
                  ) : (
                    entries.map((entry) => (
                      <div
                        key={entry._id}
                        onClick={() => setSelectedEntry(entry)}
                        className="p-md flex items-center gap-md hover:bg-surface-variant transition-colors cursor-pointer group"
                      >
                        <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold">
                          {(entry.employeeName || entry.employee?.name || 'FS').split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-label-md text-on-surface font-bold truncate">
                            {entry.employeeName || entry.employee?.name || 'Unknown Agent'}
                          </h4>
                          <p className="text-xs text-on-surface-variant truncate">
                            {entry.shopDetails?.name || 'Shop Details'} — {entry.placeOfWork}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-xs">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            entry.status === 'Submitted'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {entry.status}
                          </span>
                          <span className="text-[10px] text-on-surface-variant">
                            {new Date(entry.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </>
        )}
      </main>

      {/* CREATE EMPLOYEE ACCOUNT MODAL */}
      {showCreateUserModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-md bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl border border-outline-variant p-xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-lg">
              <h3 className="font-headline-md text-headline-md font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">person_add</span>
                Create Account
              </h3>
              <button
                onClick={() => {
                  setShowCreateUserModal(false);
                  setRegisterError('');
                  setRegisterSuccess('');
                }}
                className="text-on-surface-variant hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {registerError && (
              <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-lg text-xs font-semibold border border-error/20 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">error</span>
                {registerError}
              </div>
            )}
            {registerSuccess && (
              <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg text-xs font-semibold border border-green-200 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                {registerSuccess}
              </div>
            )}

            <form onSubmit={handleRegisterUser} className="space-y-md">
              <div className="space-y-1">
                <label className="block text-label-md text-on-surface font-semibold">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Employee Full Name"
                  className="w-full border border-soft-accent rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  value={newUserData.name}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-label-md text-on-surface font-semibold">Employee ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. FT-99088"
                  className="w-full border border-soft-accent rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  value={newUserData.employeeId}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, employeeId: e.target.value }))}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-label-md text-on-surface font-semibold">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="employee@fieldtrack.com"
                  className="w-full border border-soft-accent rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-label-md text-on-surface font-semibold">Secure Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  className="w-full border border-soft-accent rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-label-md text-on-surface font-semibold">Organization Role</label>
                <select
                  className="w-full border border-soft-accent rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  value={newUserData.role}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, role: e.target.value }))}
                >
                  <option value="agent">Field Agent (Standard Access)</option>
                  <option value="admin">System Admin (Full Management)</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  className="flex-1 py-3 border-2 border-[#c6c4d8] text-on-surface-variant font-bold rounded-lg hover:bg-surface-container transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={registering}
                  className="flex-1 py-3 bg-primary hover:bg-[#8494FF] text-white font-bold rounded-lg shadow transition-all active:scale-95 disabled:opacity-75"
                >
                  {registering ? 'Creating...' : 'Register User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FIELD WORK SUBMISSION INSPECTION MODAL */}
      {selectedEntry && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-md bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl border border-outline-variant p-xl overflow-y-auto max-h-[90vh] flex flex-col gap-md">
            <div className="flex justify-between items-start border-b border-surface-container-high pb-md">
              <div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                  selectedEntry.status === 'Submitted'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {selectedEntry.status}
                </span>
                <h3 className="font-headline-md text-headline-md font-bold text-on-surface mt-1">
                  {selectedEntry.shopDetails?.name || 'Unnamed Submission'}
                </h3>
                <p className="text-xs text-on-surface-variant font-label-md">
                  Submitted by: {selectedEntry.employeeName || selectedEntry.employee?.name} ({selectedEntry.employeeId || selectedEntry.employee?.employeeId})
                </p>
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
                className="text-on-surface-variant hover:text-primary transition-colors p-1"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-md text-sm">
              {/* Left Column: Details */}
              <div className="space-y-md">
                <div className="bg-surface-container-low p-md rounded-lg space-y-2">
                  <h4 className="font-bold text-primary text-xs uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    Visit Metadata
                  </h4>
                  <div>
                    <p className="text-[11px] text-on-surface-variant uppercase">Place of Work</p>
                    <p className="font-bold">{selectedEntry.placeOfWork}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-on-surface-variant uppercase">Date of Visit</p>
                    <p className="font-bold">{new Date(selectedEntry.dateOfVisit).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-on-surface-variant uppercase">GPS Coordinates</p>
                    <p className="font-mono text-xs font-bold">
                      {selectedEntry.location?.latitude}° N, {selectedEntry.location?.longitude}° W
                    </p>
                  </div>
                </div>

                <div className="bg-surface-container-low p-md rounded-lg space-y-2">
                  <h4 className="font-bold text-primary text-xs uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">storefront</span>
                    Shop Details
                  </h4>
                  <div>
                    <p className="text-[11px] text-on-surface-variant uppercase">Owner Name</p>
                    <p className="font-bold">{selectedEntry.shopDetails?.ownerName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-on-surface-variant uppercase">Phone Number</p>
                    <p className="font-bold">{selectedEntry.shopDetails?.phoneNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-on-surface-variant uppercase">Address</p>
                    <p className="font-bold leading-tight">{selectedEntry.shopDetails?.address || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-on-surface-variant uppercase">Category</p>
                    <span className="inline-block mt-0.5 px-2 py-0.5 bg-tertiary-fixed-dim text-on-tertiary-fixed text-xs rounded uppercase">
                      {selectedEntry.shopDetails?.category || 'General'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Media Attachments */}
              <div className="space-y-md">
                <div className="bg-surface-container-low p-md rounded-lg space-y-2">
                  <h4 className="font-bold text-primary text-xs uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">photo_library</span>
                    Shop Images ({selectedEntry.media?.images?.length || 0})
                  </h4>
                  {selectedEntry.media?.images?.length > 0 ? (
                    <div className="grid grid-cols-2 gap-sm">
                      {selectedEntry.media.images.map((url, idx) => (
                        <a
                          key={idx}
                          href={url.startsWith('http') ? url : `http://localhost:5000${url}`}
                          target="_blank"
                          rel="noreferrer"
                          className="aspect-square rounded overflow-hidden border border-outline-variant hover:opacity-85 transition-opacity"
                        >
                          <img
                            src={url.startsWith('http') ? url : `http://localhost:5000${url}`}
                            alt={`Upload ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-on-surface-variant italic">No images uploaded.</p>
                  )}
                </div>

                <div className="bg-surface-container-low p-md rounded-lg space-y-2">
                  <h4 className="font-bold text-primary text-xs uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">mic</span>
                    Audio Attachments
                  </h4>
                  {selectedEntry.media?.employeeVoiceNote ? (
                    <div className="mb-2">
                      <p className="text-[10px] text-on-surface-variant uppercase font-bold mb-1">Employee Voice Note</p>
                      <audio
                        controls
                        src={
                          selectedEntry.media.employeeVoiceNote.startsWith('http')
                            ? selectedEntry.media.employeeVoiceNote
                            : `http://localhost:5000${selectedEntry.media.employeeVoiceNote}`
                        }
                        className="w-full h-8"
                      />
                    </div>
                  ) : (
                    <p className="text-xs text-on-surface-variant italic">No employee voice note attached.</p>
                  )}

                  {selectedEntry.media?.shopRepVoiceNote ? (
                    <div className="pt-2 border-t border-outline-variant">
                      <p className="text-[10px] text-on-surface-variant uppercase font-bold mb-1">Shop Representative Note</p>
                      <audio
                        controls
                        src={
                          selectedEntry.media.shopRepVoiceNote.startsWith('http')
                            ? selectedEntry.media.shopRepVoiceNote
                            : `http://localhost:5000${selectedEntry.media.shopRepVoiceNote}`
                        }
                        className="w-full h-8"
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="pt-md border-t border-surface-container-high flex gap-3 justify-end">
              {selectedEntry.status === 'Draft' && (
                <button
                  onClick={() => {
                    handleEditDraft(selectedEntry);
                    setSelectedEntry(null);
                  }}
                  className="px-6 py-2.5 bg-primary text-white font-bold rounded-lg shadow hover:bg-[#8494FF] transition-all"
                >
                  Edit Draft
                </button>
              )}
              <button
                onClick={() => setSelectedEntry(null)}
                className="px-6 py-2.5 border border-[#c6c4d8] hover:bg-surface-container text-on-surface-variant font-bold rounded-lg transition-all"
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
