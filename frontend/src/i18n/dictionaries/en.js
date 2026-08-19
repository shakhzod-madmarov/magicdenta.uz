const en = {
  common: {
    enabled: 'Enabled', disabled: 'Disabled', yes: 'Yes', no: 'No', loading: 'Loading...', save: 'Save', cancel: 'Cancel', close: 'Close', show: 'Show', hide: 'Hide', currentVersion: 'Current version', newVersion: 'New version', mandatory: 'Required', unknown: 'Unknown'
  },
  language: { label: 'Language', uz: 'O‘zbek', ru: 'Русский', en: 'English' },
  shell: {
    panelTitle: 'Dentist panel', roleFallback: 'Dentist', menuOpen: 'Open menu', titleDefault: 'Dentist',
    nav: { dashboard: 'Dashboard', appointments: 'Appointments', patients: 'Patients', newPatient: 'New patient', templates: 'Templates', license: 'License' }
  },
  errors: {
    rootTitle: 'MedInson page stopped because of an error', rootDescription: 'Reload the app. If the problem continues, send the log file to support.', backend: 'Local server', logFile: 'Error log', error: 'Error', reload: 'Reload', goHome: 'Go to home'
  },
  license: {
    section: 'License', statusTitle: 'License status', activeSubtitle: 'Dental AI assistant', syncButton: 'Update license via internet', status: 'Status', paidUntil: 'Paid until', offlineUntil: 'Offline until', extraDays: 'Extra days', lastSync: 'Last sync', device: 'Device', version: 'Version', featuresTitle: 'Enabled features', core: 'Core system', telegram: 'Telegram', ai: 'AI assistant', reports: 'Reports', backup: 'Backup', aiDisclaimer: 'The AI assistant is not a final diagnosis. The final decision must be confirmed by the dentist after clinical examination.', bannerTitle: 'Warning', bannerFallback: 'Connect to the internet and update the license.', bannerDataSafe: 'Patient data is not deleted; paid features are limited.', bannerButton: 'Update license', overdueBannerTitle: 'Payment Period Expired', overdueBannerText: 'Grace days have started. Renew subscription/payment to avoid app restrictions.', blockedTitle: 'License needs to be updated.', blockedBody: 'Connect to the internet and update the license. Patients, X-rays, and clinic data are not deleted. After payment/subscription is extended in the admin panel, update the license here.',
    activation: { title: 'Activate license', description: 'When AI is included in the subscription, the analysis module is prepared automatically. Analysis is available from Appointments.', licenseKey: 'License key', phone: 'Phone', email: 'Email', login: 'Login (phone or email)', password: 'Password', dentist: 'Doctor', clinic: 'Clinic', activate: 'Activate', forgot: 'Forgot password?', show: 'Show', hide: 'Hide' },
    profile: { title: 'Update clinic information', description: 'This change is saved only when internet is available and syncs with the admin panel. The license is linked by internal customer ID.', clinic: 'Clinic name', doctor: 'Doctor', phone: 'Phone', email: 'Email', save: 'Save information' }
  },
  update: {
    section: 'Update', available: 'New version available: {version}', defaultTitle: 'MedInson Stomatolog update is ready.', createBackupAndDownload: 'Create backup and start update', backupInfo: 'AI is prepared automatically as part of the active subscription.', installFailedSafe: "The update could not be installed automatically. Download the installer manually or contact support.", integrityFailedSafe: "The installer file did not match the checksum. Fix SHA256 in the admin portal and publish the update again.", lastBackup: 'Last pre-update backup', openBackupFolder: 'Open backup folder', noUpdate: 'No app update found', updateFound: 'New version available: {version}', backupStarting: 'Creating backup before update...', backupReady: 'Pre-update backup was created.', downloadOpened: 'New version installer started',
    downloadingAndInstalling: 'The new version is downloading and installation will start.',
    installStarted: 'New version installation has started. The app will close.',
    installFailed: 'Could not install the new version.', downloadMissing: 'Download link not found', backupFailedStop: 'Backup was not created. Update was stopped to keep data safe.',
    upToDate: 'Up to date',
    sameVersionHidden: 'When the installed version and server version are the same, the update card is hidden.',
    checkAgain: 'Check again',
    downloadProgress: 'Downloading update: {percent}%',
    desktopInstallUnavailable: 'Automatic installation is available only in the desktop app.',
    manualDownload: 'Download manually',
    openDownloadedInstaller: 'Open downloaded installer',
    installerSavedAt: 'Installer saved at',
    downloadFallbackHint: 'If the installer window does not open automatically, download and run the installer manually.',
    installWindowHint: 'If Windows asks for permission, click “Yes”.',
    mobileUpdateAvailable: 'Mobile Update Available',
    pairedDeviceOutdated: 'Connected mobile device version is outdated',
    mobileUpdateSuggest: 'Please update the mobile application to the latest stable version. Scan the QR code below using your device camera.',
    downloadMobileUpdate: 'Download Mobile App',
    scanToDownload: 'Scan to download'
  },
  aiPack: {
    section: 'AI assistant',
    title: 'Local offline AI component',
    description: 'Download and install the AI Pack into AppData to analyze panoramic X-rays on this computer.',
    status: 'Status',
    model: 'Model',
    installPath: 'Install path',
    archivePath: 'Downloaded archive',
    ready: 'Ready',
    notInstalled: 'Not installed',
    installButton: 'Install AI component',
    reinstallButton: 'Reinstall AI component',
    checkButton: 'Check AI status',
    backupInfo: 'The app creates an automatic backup first, then downloads the AI Pack, verifies SHA256, and installs it into AppData.',
    backupStarting: 'Creating backup before AI Pack installation...',
    backupReady: 'Backup for AI Pack installation was created.',
    backupFailedStop: 'Backup was not created. AI Pack installation was stopped.',
    downloadProgress: 'Downloading AI Pack: {percent}%',
    verifying: 'Verifying AI component file...',
    extracting: 'Extracting AI component archive...',
    installing: 'Installing AI component...',
    installed: 'AI component is ready.',
    installFailed: 'Could not install AI Pack.',
    statusFailed: 'Could not check AI Pack status.',
    desktopOnly: 'Automatic AI component installation works only in the desktop app.',
    manualDownload: 'Download AI component manually',
    openFolder: 'Open AI component folder',
    autoInstalling: 'Your AI subscription is active. The analysis module is being prepared automatically...',
    includedNotInstalled: 'AI is included in the subscription. The analysis module is being prepared automatically or needs repair.',
    notIncluded: 'AI is not included in this subscription.',
    retryButton: 'Download / repair AI component',
    retrying: 'Connection was interrupted. Retrying AI component download...',
    resumeProgress: 'Resuming AI component download: {percent}%'
  },
  templates: {
    title: 'Templates', subtitle: 'Prepare frequently used diagnoses, teeth, completed work, recommendations, medicines, and notes in advance.', searchPlaceholder: 'Search template...', newTitle: 'New template', editTitle: 'Edit template', helpText: 'Enter once, then apply with one click when finishing an appointment.', nameLabel: 'Template name', namePlaceholder: 'Example: caries filling', diagnosisLabel: 'Disease / diagnosis', teethLabel: 'Teeth', teethPlaceholder: 'Example: 16, 17', priceLabel: 'Price (UZS)', favoriteLabel: 'Show in quick pick', proceduresLabel: 'Completed work', nextStepLabel: 'Next step', medicinesLabel: 'Medicines', notesLabel: 'Notes', save: 'Save template', update: 'Update template', saving: 'Saving...', waiting: 'Waiting...', existingTitle: 'Existing templates', existingDescription: 'Ready-made list for quick selection when finishing an appointment.', count: '{count}', empty: 'No templates yet.', quick: 'Quick', usedCount: 'Used: {count} times', last: 'Last', edit: 'Edit', delete: 'Delete', cancel: 'Cancel', confirmDelete: 'Delete this template?', diagnosisShort: 'Diagnosis', teethShort: 'Teeth', proceduresShort: 'Work',
    saveSuccess: 'Template saved',
    saveFailed: 'Template not saved',
    updateSuccess: 'Template updated',
    updateFailed: 'Could not update template',
    deleteSuccess: 'Template deleted',
    deleteFailed: 'Could not delete template',
    nameRequired: 'Template name is required',
    atLeastOneFieldRequired: 'Fill at least one content field',
    notFound: 'Template not found',
    duplicateName: 'A template with this name already exists',
    deleting: 'Deleting...',
  },
  reminders: { expiringSoon: 'Your license expires soon. Please remember to renew the subscription.', graceSoon: 'Grace days are almost over. Update the license so the app is not restricted.' }
};
export default en;
