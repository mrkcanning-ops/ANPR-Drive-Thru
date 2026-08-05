'use client';

import { useEffect, useState } from 'react';
import { supabase, Order, DailyStats, Vehicle, Customer, VehicleCustomer } from '@/lib/supabase';
import { Sidebar } from '@/components/Sidebar';
import { BottomNav } from '@/components/BottomNav';
import { VehicleCardSection } from '@/components/dashboard/VehicleCardSection';
import { CustomersSection } from '@/components/dashboard/CustomersSection';
import { NotesLoyaltySection } from '@/components/dashboard/NotesLoyaltySection';
import { OrdersSection } from '@/components/dashboard/OrdersSection';
import { CameraSection } from '@/components/dashboard/CameraSection';
import { DetectedPlatesSection } from '@/components/dashboard/DetectedPlatesSection';
import { PlateRecognitionModal } from '@/components/PlateRecognitionModal';
import { LaneStatusSection, TopItemsSection, RecognitionConfidenceSection } from '@/components/dashboard/StatusSections';
import { Radio, Car, ChevronDown, ChevronRight, X } from 'lucide-react';

const MAX_ARRIVALS = 8;
const MAX_FRAME_BUFFER = 10;

interface FrameCapture {
  blob: Blob;
  url: string;
  timestamp: number;
}

function DashboardContent() {
  const [time, setTime] = useState<string>('');
  const [cameraRefresh, setCameraRefresh] = useState<number>(0);
  const [detectedPlates, setDetectedPlates] = useState<any[]>([]);
  const [anprProcessing, setAnprProcessing] = useState(false);
  const [lastAnprTime, setLastAnprTime] = useState(0);

  // Plate Recognition Modal state
  const [showPlateModal, setShowPlateModal] = useState(false);
  const [lastDetectedPlate, setLastDetectedPlate] = useState('');
  const [detectedVehicleData, setDetectedVehicleData] = useState<any>(null);

  // Recent arrivals timeline - auto-feeds as new plates are detected
  // Load from localStorage on mount to persist across page refreshes
  const [recentArrivals, setRecentArrivals] = useState<{ time: string; plate: string }[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('recentArrivals');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Error loading recent arrivals from localStorage:', e);
      return [];
    }
  });

  // Rolling buffer of recently captured frames, used to pick a still image to store per-vehicle
  const [frameBuffer, setFrameBuffer] = useState<FrameCapture[]>([]);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [savingImage, setSavingImage] = useState(false);

  // New state for multi-customer vehicle support
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [vehicleCustomers, setVehicleCustomers] = useState<(VehicleCustomer & { customer: Customer })[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [availableCustomers, setAvailableCustomers] = useState<Customer[]>([]);
  
  const [stats, setStats] = useState({
    activeOrders: 0,
    totalOrders: 0,
    revenue: 0,
    avgOrderTime: 0,
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Update time display
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Persist recent arrivals to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('recentArrivals', JSON.stringify(recentArrivals));
    } catch (e) {
      console.error('Error saving recent arrivals to localStorage:', e);
    }
  }, [recentArrivals]);

  // Refresh camera snapshot every 100ms (10 fps)
  useEffect(() => {
    const cameraInterval = setInterval(() => {
      setCameraRefresh(prev => {
        const newValue = prev + 1;
        // Run ANPR processing every 60 frames (0.167 fps at 100ms = 6 sec processing)
        // This prevents rate limiting on Plate Recognizer API (free tier: ~10 req/min)
        if (newValue % 60 === 0 && !anprProcessing) {
          processAnpr();
        }
        return newValue;
      });
    }, 100);
    return () => clearInterval(cameraInterval);
  }, [anprProcessing]);

  useEffect(() => {
    fetchDashboardData();
    // Subscribe to real-time updates
    const subscription = supabase
      .channel('orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Add a newly detected plate to the front of the arrivals timeline (auto-feed).
  // Skips duplicates of the most recent entry so a lingering vehicle doesn't spam the strip.
  const registerArrival = (plate: string) => {
    setRecentArrivals(prev => {
      if (prev.length > 0 && prev[0].plate === plate) return prev;
      const timeStr = new Date().toLocaleTimeString('en-GB', { hour12: false });
      return [{ time: timeStr, plate }, ...prev].slice(0, MAX_ARRIVALS);
    });
  };

  // ANPR processing function - runs at 0.5 fps (every 20 frames at 100ms).
  // Captures the camera snapshot once, buffers it for the vehicle-photo picker,
  // then sends the same image directly to the ANPR endpoint (no duplicate capture).
  const processAnpr = async () => {
    setAnprProcessing(true);
    const debugTimestamp = new Date().toLocaleTimeString('en-GB', { hour12: false });
    console.log(`[ANPR-DEBUG ${debugTimestamp}] ========== ANPR CYCLE START ==========`);
    
    try {
      // STEP 1: Capture frame from camera
      console.log(`[ANPR-DEBUG ${debugTimestamp}] Step 1: Fetching camera snapshot...`);
      const snapshotRes = await fetch(`/api/camera?t=${cameraRefresh}`);
      console.log(`[ANPR-DEBUG ${debugTimestamp}] Step 1 Result: status=${snapshotRes.status}`);
      
      if (!snapshotRes.ok) {
        console.error(`[ANPR-DEBUG ${debugTimestamp}] ERROR: Camera API returned ${snapshotRes.status}. Response:`, await snapshotRes.text());
        return;
      }
      
      const blob = await snapshotRes.blob();
      console.log(`[ANPR-DEBUG ${debugTimestamp}] Step 1 Complete: Received blob of size ${blob.size} bytes`);

      // Buffer frame for image picker
      const frameUrl = URL.createObjectURL(blob);
      setFrameBuffer(prev => {
        const dropped = prev.slice(MAX_FRAME_BUFFER - 1);
        dropped.forEach(f => URL.revokeObjectURL(f.url));
        return [{ blob, url: frameUrl, timestamp: Date.now() }, ...prev].slice(0, MAX_FRAME_BUFFER);
      });

      // STEP 2: Send blob to ANPR endpoint
      console.log(`[ANPR-DEBUG ${debugTimestamp}] Step 2: Sending blob to ANPR endpoint...`);
      const formData = new FormData();
      formData.append('image', blob, 'snapshot.jpg');

      const response = await fetch('/api/anpr', {
        method: 'POST',
        body: formData,
      });

      console.log(`[ANPR-DEBUG ${debugTimestamp}] Step 2 Result: status=${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[ANPR-DEBUG ${debugTimestamp}] ERROR: ANPR endpoint returned ${response.status}. Response:`, errorText);
        return;
      }

      const data = await response.json();
      console.log(`[ANPR-DEBUG ${debugTimestamp}] Step 2 Complete: ANPR response:`, data);

      // STEP 3: Process detected plates
      console.log(`[ANPR-DEBUG ${debugTimestamp}] Step 3: Processing plates...`);
      if (data.plates && data.plates.length > 0) {
        console.log(`[ANPR-DEBUG ${debugTimestamp}] Found ${data.plates.length} plate(s):`, data.plates.map((p: any) => `${p.plate} (conf: ${p.confidence})`));
        setDetectedPlates(data.plates);
        
        // Auto-select the highest confidence plate
        const topPlate = data.plates.reduce((max: any, plate: any) =>
          (plate.confidence > max.confidence) ? plate : max
        );
        
        if (topPlate?.plate) {
          console.log(`[ANPR-DEBUG ${debugTimestamp}] Top plate: ${topPlate.plate} with confidence ${topPlate.confidence}`);
          fetchVehicleData(topPlate.plate);
          registerArrival(topPlate.plate);
          console.log(`[ANPR-DEBUG ${debugTimestamp}] Registered arrival: ${topPlate.plate}`);
          
          // Show modal for new plate (only if different from last detected)
          if (lastDetectedPlate !== topPlate.plate) {
            setLastDetectedPlate(topPlate.plate);
            setDetectedVehicleData(topPlate.vehicle); // Pass vehicle detection data
            setShowPlateModal(true);
          }
        }
      } else {
        console.log(`[ANPR-DEBUG ${debugTimestamp}] No plates detected in frame`);
      }
    } catch (error) {
      console.error(`[ANPR-DEBUG ${debugTimestamp}] EXCEPTION during ANPR processing:`, error);
    } finally {
      setAnprProcessing(false);
      setLastAnprTime(Date.now());
      console.log(`[ANPR-DEBUG ${debugTimestamp}] ========== ANPR CYCLE END ==========\n`);
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch active orders
      const { data: activeOrders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .in('status', ['pending', 'preparing'])
        .order('created_at', { ascending: false })
        .limit(4);

      if (ordersError) throw ordersError;

      setOrders(activeOrders || []);

      // Calculate stats
      const totalOrders = activeOrders?.length || 0;
      const revenue = activeOrders?.reduce((sum, order) => sum + order.total_price, 0) || 0;

      setStats({
        activeOrders: activeOrders?.filter((o) => o.status === 'pending').length || 0,
        totalOrders: totalOrders,
        revenue: revenue,
        avgOrderTime: 8.5,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch vehicle details and linked customers
  const fetchVehicleData = async (plate: string) => {
    try {
      // Normalize plate: remove spaces and convert to uppercase for consistent matching
      const normalizedPlate = plate.replace(/\s+/g, '').toUpperCase();
      console.log(`[ANPR-DEBUG] Fetching vehicle for plate: "${plate}" (normalized: "${normalizedPlate}")`);
      
      // Try multiple query approaches for robustness
      // Approach 1: Direct case-insensitive query
      let { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicles')
        .select('*')
        .ilike('plate', normalizedPlate);

      if (vehicleError) {
        console.error(`[ANPR-DEBUG] Query error (ilike):`, vehicleError.message);
      } else if (vehicleData && vehicleData.length > 0) {
        console.log(`[ANPR-DEBUG] Found ${vehicleData.length} vehicle(s) with ilike. Using first match:`, vehicleData[0]);
        setVehicle(vehicleData[0]);
      } else {
        // Approach 2: Fetch all vehicles and filter client-side for debugging
        console.log(`[ANPR-DEBUG] No results from ilike, fetching all vehicles for manual comparison...`);
        const { data: allVehicles, error: allError } = await supabase
          .from('vehicles')
          .select('plate');

        if (allError) {
          console.error(`[ANPR-DEBUG] Error fetching all vehicles:`, allError.message);
        } else {
          console.log(`[ANPR-DEBUG] Total vehicles in database: ${allVehicles?.length || 0}`);
          if (allVehicles) {
            allVehicles.forEach((v: any) => {
              console.log(`[ANPR-DEBUG]   DB plate: "${v.plate}" | Normalized input: "${normalizedPlate}" | Match: ${v.plate.toUpperCase() === normalizedPlate}`);
            });
          }
        }
        
        // Clear vehicle state if not found
        console.log(`[ANPR-DEBUG] Vehicle not found for plate: "${normalizedPlate}"`);
        setVehicle(null);
        setVehicleCustomers([]);
        setSelectedCustomer(null);
        return;
      }

      if (!vehicleData) {
        console.log(`[ANPR-DEBUG] Vehicle not found for plate: "${normalizedPlate}"`);
        setVehicle(null);
        setVehicleCustomers([]);
        setSelectedCustomer(null);
        return;
      }

      console.log(`[ANPR-DEBUG] Vehicle found in database:`, vehicleData[0]);
      setVehicle(vehicleData[0]);

      // Fetch customers linked to this vehicle
      const { data: customersData, error: customersError } = await supabase
        .from('vehicle_customers')
        .select('*, customer:customer_id(*)')
        .eq('vehicle_id', vehicleData[0].id);

      if (customersError) {
        console.error('Error fetching vehicle customers:', customersError);
        return;
      }

      setVehicleCustomers(customersData || []);
      
      // Set first customer as selected (primary driver if available)
      const primaryDriver = customersData?.find(vc => vc.primary_driver);
      if (primaryDriver && primaryDriver.customer) {
        setSelectedCustomer(primaryDriver.customer);
      } else if (customersData && customersData.length > 0 && customersData[0].customer) {
        setSelectedCustomer(customersData[0].customer);
      }

      // Fetch all available customers for adding
      const { data: allCustomers } = await supabase
        .from('customers')
        .select('*');

      setAvailableCustomers(allCustomers || []);
    } catch (error) {
      console.error('Error fetching vehicle data:', error);
    }
  };

  // Add customer to vehicle
  const addCustomerToVehicle = async (customerId: string) => {
    if (!vehicle) return;
    
    try {
      const { error } = await supabase
        .from('vehicle_customers')
        .insert([
          {
            vehicle_id: vehicle.id,
            customer_id: customerId,
            relationship: 'shared',
            primary_driver: false,
          },
        ]);

      if (error) throw error;
      
      // Refresh vehicle customers
      await fetchVehicleData(vehicle.plate);
      setShowAddCustomer(false);
    } catch (error) {
      console.error('Error adding customer to vehicle:', error);
    }
  };

  // Add a new vehicle and driver to the system
  const handleAddVehicleAndDriver = async (plate: string, driverName: string, vehicleInfo: string) => {
    try {
      // Normalize plate: remove spaces and convert to uppercase for consistent storage
      const normalizedPlate = plate.replace(/\s+/g, '').toUpperCase();
      console.log(`[ADD-VEHICLE] Starting vehicle/driver creation for plate: "${normalizedPlate}"`);
      
      // Step 1: Get the next sequential customer number
      console.log(`[ADD-VEHICLE] Step 1: Finding next customer number...`);
      const { data: allCustomers, error: fetchError } = await supabase
        .from('customers')
        .select('customer_number')
        .order('customer_number', { ascending: false })
        .limit(1);

      if (fetchError) {
        console.error(`[ADD-VEHICLE] ERROR fetching max customer number:`, fetchError);
        throw fetchError;
      }

      const nextCustomerNumber = (allCustomers && allCustomers.length > 0) 
        ? allCustomers[0].customer_number + 1 
        : 1;
      
      console.log(`[ADD-VEHICLE] Step 1 Complete: Next customer number will be ${nextCustomerNumber}`);

      // Step 2: Create new customer with sequential number
      console.log(`[ADD-VEHICLE] Step 2: Creating customer #${nextCustomerNumber} "${driverName}"...`);
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert([
          {
            customer_number: nextCustomerNumber,
            name: driverName,
            email: '',
            phone: '',
            loyalty_points: 0,
          },
        ])
        .select()
        .single();

      if (customerError) {
        console.error(`[ADD-VEHICLE] ERROR creating customer:`, customerError);
        throw customerError;
      }
      console.log(`[ADD-VEHICLE] Step 2 Complete: Customer #${nextCustomerNumber} created with ID ${newCustomer.id}`);

      // Step 3: Create a new vehicle
      console.log(`[ADD-VEHICLE] Step 3: Creating vehicle with plate "${normalizedPlate}"...`);
      const { data: newVehicle, error: vehicleError } = await supabase
        .from('vehicles')
        .insert([
          {
            plate: normalizedPlate,
            description: vehicleInfo || 'Unknown vehicle',
            make: '',
            model: '',
            year: new Date().getFullYear(),
          },
        ])
        .select()
        .single();

      if (vehicleError) {
        console.error(`[ADD-VEHICLE] ERROR creating vehicle:`, vehicleError);
        throw vehicleError;
      }
      console.log(`[ADD-VEHICLE] Step 3 Complete: Vehicle created with ID ${newVehicle.id}`);

      // Step 4: Link the vehicle to the customer as primary driver
      console.log(`[ADD-VEHICLE] Step 4: Linking vehicle ${newVehicle.id} to customer #${nextCustomerNumber}...`);
      const { error: linkError } = await supabase
        .from('vehicle_customers')
        .insert([
          {
            vehicle_id: newVehicle.id,
            customer_id: newCustomer.id,
            primary_driver: true,
            relationship: 'owner',
          },
        ]);

      if (linkError) {
        console.error(`[ADD-VEHICLE] ERROR linking vehicle to customer:`, linkError);
        throw linkError;
      }
      console.log(`[ADD-VEHICLE] Step 4 Complete: Vehicle linked to customer`);

      // Step 5: Fetch the updated vehicle data to populate the modal
      console.log(`[ADD-VEHICLE] Step 5: Fetching vehicle data for plate "${normalizedPlate}"...`);
      await fetchVehicleData(normalizedPlate);
      console.log(`[ADD-VEHICLE] SUCCESS: Vehicle and customer #${nextCustomerNumber} added successfully`);
    } catch (error) {
      console.error(`[ADD-VEHICLE] EXCEPTION:`, error);
      throw error;
    }
  };

  // Remove customer from vehicle
  const removeCustomerFromVehicle = async (vehicleCustomerId: string) => {
    try {
      const { error } = await supabase
        .from('vehicle_customers')
        .delete()
        .eq('id', vehicleCustomerId);

      if (error) throw error;
      
      if (vehicle) {
        await fetchVehicleData(vehicle.plate);
      }
    } catch (error) {
      console.error('Error removing customer from vehicle:', error);
    }
  };

  // Upload a picked frame as the vehicle's stored still image and save the URL on the vehicle record
  const saveVehicleImage = async (blob: Blob) => {
    if (!vehicle) return;
    setSavingImage(true);
    try {
      const fileName = `${vehicle.id}-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('vehicle-photos')
        .upload(fileName, blob, { contentType: 'image/jpeg', upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('vehicle-photos').getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('vehicles')
        .update({ image_url: publicUrlData.publicUrl })
        .eq('id', vehicle.id);

      if (updateError) throw updateError;

      setVehicle({ ...vehicle, image_url: publicUrlData.publicUrl });
      setShowImagePicker(false);
    } catch (error) {
      console.error('Error saving vehicle image:', error);
    } finally {
      setSavingImage(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50 overflow-hidden pb-16 lg:pb-0">
      {/* Desktop Sidebar */}
      <Sidebar activeItem="Dashboard" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
            <span className="text-emerald-600 font-semibold text-sm">Lane 1 Online</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 border border-emerald-500 text-emerald-600 text-xs font-semibold px-3 py-1 rounded-full">
              <Radio size={12} /> Live
            </span>
            <span className="text-gray-900 font-semibold text-sm">{time}</span>
            <ChevronDown size={16} className="text-gray-400" />
          </div>
        </div>

        {/* Timeline Strip */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 flex-shrink-0 text-gray-700">
              <Car size={18} />
              <span className="text-sm font-semibold leading-tight">Recent<br />Arrivals</span>
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {recentArrivals.map((item) => (
                <button
                  key={item.plate}
                  onClick={() => fetchVehicleData(item.plate)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg border-2 text-left transition-colors ${
                    vehicle?.plate === item.plate ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="text-xs text-gray-400">{item.time}</p>
                  <p className="text-sm font-bold text-gray-900">{item.plate.toUpperCase()}</p>
                </button>
              ))}
            </div>
            <button className="flex-shrink-0 w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 ml-auto">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full">
            {/* LEFT COLUMN */}
            <div className="lg:col-span-3 space-y-6 flex flex-col">
              {/* Vehicle Card */}
              <div className="bg-white rounded-lg shadow-sm">
                <VehicleCardSection vehicle={vehicle} onStoreImage={() => setShowImagePicker(true)} />
              </div>

              {/* Customers Section */}
              <div className="bg-purple-50 rounded-lg shadow-sm">
                <CustomersSection 
                  vehicleCustomers={vehicleCustomers} 
                  selectedCustomer={selectedCustomer} 
                  onSelectCustomer={setSelectedCustomer} 
                />
              </div>

              {/* Notes & Loyalty */}
              <div className="bg-gray-50 rounded-lg shadow-sm flex-1">
                <NotesLoyaltySection selectedCustomer={selectedCustomer} />
              </div>

              {/* Orders */}
              <div className="bg-white rounded-lg shadow-sm">
                <OrdersSection />
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="lg:col-span-2 space-y-6 flex flex-col">
              {/* Live Camera */}
              <div className="bg-slate-900 rounded-lg shadow-sm h-64">
                <CameraSection />
              </div>

              {/* Detected Plates */}
              <div className="bg-blue-600 rounded-lg shadow-sm">
                <DetectedPlatesSection vehicle={vehicle} time={time} />
              </div>

              {/* Lane Status & Top Items */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-emerald-50 rounded-lg shadow-sm">
                  <LaneStatusSection />
                </div>
                <div className="bg-white rounded-lg shadow-sm">
                  <TopItemsSection />
                </div>
              </div>

              {/* Recognition Confidence */}
              <div className="bg-white rounded-lg shadow-sm">
                <RecognitionConfidenceSection />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation for Tablet/Mobile */}
      <BottomNav />

      {/* Plate Recognition Modal */}
      <PlateRecognitionModal
        isOpen={showPlateModal}
        plate={lastDetectedPlate}
        vehicle={vehicle}
        vehicleCustomers={vehicleCustomers}
        selectedCustomer={selectedCustomer}
        availableCustomers={availableCustomers}
        onClose={() => setShowPlateModal(false)}
        onSelectCustomer={setSelectedCustomer}
        onAddVehicle={handleAddVehicleAndDriver}
        vehicleData={detectedVehicleData}
      />

      {/* Vehicle Image Picker Modal */}
      {showImagePicker && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => !savingImage && setShowImagePicker(false)}
        >
          <div className="bg-white rounded-xl p-4 max-w-2xl w-full max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <h3 className="font-bold text-gray-900">
                Select a still image for {vehicle?.plate || 'this vehicle'}
              </h3>
              <button
                onClick={() => !savingImage && setShowImagePicker(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-3 flex-shrink-0">
              Choose the clearest frame from the footage of this vehicle entering the drive-through.
            </p>
            {frameBuffer.length === 0 ? (
              <p className="text-sm text-gray-500">
                No footage buffered yet. Keep this vehicle in view for a few seconds while frames are captured.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 overflow-y-auto">
                {frameBuffer.map((frame) => (
                  <button
                    key={frame.timestamp}
                    onClick={() => saveVehicleImage(frame.blob)}
                    disabled={savingImage}
                    className="relative rounded-lg overflow-hidden border-2 border-transparent hover:border-emerald-500 aspect-video disabled:opacity-50"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={frame.url} alt="Captured frame" className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 right-0 bg-black/60 text-white text-[10px] px-1">
                      {new Date(frame.timestamp).toLocaleTimeString('en-GB', { hour12: false })}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {savingImage && <p className="text-xs text-emerald-600 mt-2 flex-shrink-0">Saving selected frame…</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return <DashboardContent />;
}
