import React, { useState, useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import QrScanner from 'qr-scanner';
import { User, UserFormData } from '../lib/types';
import { X, Download, Upload, Camera, FileImage, AlertCircle } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User; // For generation mode
  onUserDataScanned?: (userData: UserFormData) => void; // For scanning mode
  mode: 'generate' | 'scan';
}

/**
 * QR Code Modal Component
 * Handles both QR code generation from user data and QR code scanning
 */
const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  user,
  onUserDataScanned,
  mode
}) => {
  // Generation state
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Scanning state
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');
  const [hasCamera, setHasCamera] = useState(false);
  const [cameras, setCameras] = useState<QrScanner.Camera[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  
  // Refs for camera and file input
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);

  /**
   * Generates QR code from user data
   */
  const generateQRCode = React.useCallback(async () => {
    if (!user) return;

    setIsGenerating(true);
    try {
      // Create QR code data with user information
      const qrData = {
        type: 'user-profile',
        version: '1.0',
        data: {
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber || '',
          bio: user.bio || '',
          avatarUrl: user.avatarUrl || '',
          dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '', // Convert to YYYY-MM-DD format
          location: user.location || ''
        }
      };

      // Generate QR code as data URL
      const dataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 256,
        margin: 2,
        color: {
          dark: '#1f2937', // Dark blue-gray
          light: '#ffffff' // White
        }
      });

      setQrCodeDataUrl(dataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [user]);

  /**
   * Checks if camera is available for scanning
   */
  const checkCameraAvailability = useCallback(async () => {
    try {
      const hasCamera = await QrScanner.hasCamera();
      setHasCamera(hasCamera);
      
      if (hasCamera) {
        // Get list of available cameras
        const availableCameras = await QrScanner.listCameras(true);
        setCameras(availableCameras);
        
        // Set default camera if none selected
        if (availableCameras.length > 0 && !selectedCameraId) {
          setSelectedCameraId(availableCameras[0].id);
        }
      }
    } catch (error) {
      console.error('Error checking camera availability:', error);
      setHasCamera(false);
      setCameras([]);
    }
  }, [selectedCameraId]);

  // Generate QR code when modal opens in generate mode
  useEffect(() => {
    if (isOpen && mode === 'generate' && user) {
      generateQRCode();
    }
  }, [isOpen, mode, user, generateQRCode]);

  // Check for camera availability when modal opens in scan mode
  useEffect(() => {
    if (isOpen && mode === 'scan') {
      checkCameraAvailability();
    } else if (!isOpen) {
      // Clear all errors when modal closes
      setCameraError('');
      setUploadError('');
    }
    
    // Cleanup camera when modal closes
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
        qrScannerRef.current = null;
      }
    };
  }, [isOpen, mode, checkCameraAvailability]);

  /**
   * Downloads the generated QR code image
   */
  const downloadQRCode = () => {
    if (!qrCodeDataUrl || !user) return;

    const link = document.createElement('a');
    link.href = qrCodeDataUrl;
    link.download = `qr-code-${user.fullName.replace(/\s+/g, '-').toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * Starts camera scanning
   */
  const startCameraScanning = async () => {
    console.log('Starting camera scanning...');
    
    if (!videoRef.current) {
      console.error('Video element not found');
      setCameraError('Video element not available. Please try again.');
      return;
    }

    setIsScanning(true);
    setCameraError('');

    try {
      console.log('Creating QR scanner instance...');
      // Create QR scanner instance
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => handleScanResult(result, setCameraError)
      );

      // Set the camera if one is selected
      if (selectedCameraId) {
        console.log('Setting camera to:', selectedCameraId);
        await qrScannerRef.current.setCamera(selectedCameraId);
      }

      console.log('Starting QR scanner...');
      await qrScannerRef.current.start();
      console.log('QR scanner started successfully');
    } catch (error) {
      console.error('Error starting camera:', error);
      setCameraError(`Failed to access camera: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsScanning(false);
    }
  };

  /**
   * Stops camera scanning
   */
  const stopCameraScanning = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setIsScanning(false);
  };

  /**
   * Handles camera selection change
   */
  const handleCameraChange = async (cameraId: string) => {
    setSelectedCameraId(cameraId);
    setCameraError(''); // Clear any previous camera errors
    
    // If currently scanning, restart with new camera
    if (isScanning && qrScannerRef.current) {
      try {
        await qrScannerRef.current.setCamera(cameraId);
      } catch (error) {
        console.error('Error switching camera:', error);
        // If switching fails, stop and restart
        stopCameraScanning();
        setTimeout(() => startCameraScanning(), 100);
      }
    }
  };

  /**
   * Handles file upload for QR code scanning
   */
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError('');

    try {
      const result = await QrScanner.scanImage(file);
      handleScanResult(result, setUploadError);
    } catch (error) {
      console.error('Error scanning uploaded image:', error);
      setUploadError('Could not detect a valid QR code in the uploaded image.');
    }
  };

  /**
   * Processes scanned QR code data
   */
  const handleScanResult = (result: string, setErrorFn: (error: string) => void = () => {}) => {
    try {
      const parsedData = JSON.parse(result);

      // Validate QR code format
      if (parsedData.type !== 'user-profile' || !parsedData.data) {
        throw new Error('Invalid QR code format');
      }

      const userData: UserFormData = {
        fullName: parsedData.data.fullName || '',
        email: parsedData.data.email || '',
        phoneNumber: parsedData.data.phoneNumber || '',
        bio: parsedData.data.bio || '',
        avatarUrl: parsedData.data.avatarUrl || '',
        dateOfBirth: parsedData.data.dateOfBirth || '',
        location: parsedData.data.location || ''
      };

      // Validate required fields
      if (!userData.fullName || !userData.email) {
        throw new Error('QR code missing required user information');
      }

      // Clear any existing errors
      setCameraError('');
      setUploadError('');

      // Pass data back to parent component
      onUserDataScanned?.(userData);
      onClose();
    } catch (error) {
      console.error('Error parsing QR code:', error);
      setErrorFn('Invalid QR code format or missing required information.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {mode === 'generate' ? 'QR Code Generator' : 'QR Code Scanner'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {mode === 'generate' ? (
            // QR Code Generation Mode
            <div className="text-center">
              {user && (
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    QR Code for {user.fullName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Scan this code to import profile information
                  </p>
                </div>
              )}

              {isGenerating ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Generating QR code...</span>
                </div>
              ) : qrCodeDataUrl ? (
                <div>
                  <div className="bg-gray-50 p-4 rounded-lg inline-block">
                    <img
                      src={qrCodeDataUrl}
                      alt="User Profile QR Code"
                      className="w-64 h-64"
                    />
                  </div>
                  
                  <button
                    onClick={downloadQRCode}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download QR Code
                  </button>
                </div>
              ) : (
                <div className="text-red-600">
                  Failed to generate QR code. Please try again.
                </div>
              )}
            </div>
          ) : (
            // QR Code Scanning Mode
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  Scan QR Code
                </h3>
                <p className="text-sm text-gray-500">
                  Use your camera or upload an image to scan a user profile QR code
                </p>
              </div>

              {/* Camera Section */}
              {hasCamera ? (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                    <Camera className="w-4 h-4 mr-2" />
                    Camera Scanner
                  </h4>
                  
                  {/* Camera Selection */}
                  {cameras.length > 1 && (
                    <div className="mb-4">
                      <label htmlFor="camera-select" className="block text-sm font-medium text-gray-600 mb-2">
                        Select Camera ({cameras.length} available):
                      </label>
                      <select
                        id="camera-select"
                        value={selectedCameraId}
                        onChange={(e) => handleCameraChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {cameras.map((camera) => (
                          <option key={camera.id} value={camera.id}>
                            {camera.label || `Camera ${camera.id}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {/* Video element - always rendered but hidden when not scanning */}
                  <video
                    ref={videoRef}
                    className={`w-full h-48 bg-gray-900 rounded-lg mb-3 ${isScanning ? 'block' : 'hidden'}`}
                    style={{ objectFit: 'cover' }}
                  />
                  
                  {!isScanning ? (
                    <button
                      onClick={startCameraScanning}
                      disabled={!hasCamera}
                      className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Start Camera
                    </button>
                  ) : (
                    <div>
                      <div className="text-sm text-green-600 mb-2 flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                        Camera is active
                        {cameras.length > 1 && selectedCameraId && (
                          <span className="ml-1">
                            - {cameras.find(c => c.id === selectedCameraId)?.label || `Camera ${selectedCameraId}`}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mb-3">Point your camera at a QR code to scan it</p>
                      <button
                        onClick={stopCameraScanning}
                        className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Stop Camera
                      </button>
                    </div>
                  )}
                  
                  {/* Error display */}
                  {cameraError && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start">
                        <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm text-red-700 font-medium">Camera Error</p>
                          <p className="text-sm text-red-600 mt-1">{cameraError}</p>
                        </div>
                        <button
                          onClick={() => setCameraError('')}
                          className="ml-2 text-red-400 hover:text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                    <Camera className="w-4 h-4 mr-2" />
                    Camera Scanner
                  </h4>
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-yellow-700 font-medium">No Camera Detected</p>
                        <p className="text-sm text-yellow-600 mt-1">
                          Please make sure your device has a camera and you've granted camera permissions.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* File Upload Section */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                  <FileImage className="w-4 h-4 mr-2" />
                  Upload Image
                </h4>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-3">
                    Choose an image file containing a QR code
                  </p>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Select Image
                  </button>
                </div>
              </div>

              {/* Upload Error Display */}
              {uploadError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                    <div className="flex-1">
                      <span className="text-red-700 text-sm">{uploadError}</span>
                    </div>
                    <button
                      onClick={() => setUploadError('')}
                      className="ml-2 text-red-400 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {!hasCamera && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                    <span className="text-yellow-700 text-sm">
                      Camera not available. You can still upload image files.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
