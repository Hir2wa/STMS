import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Edit2, Trash2, MapPin, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { locationService } from '../../services/locationService';

const getErrorMessage = (error, fallback = 'Operation failed') => {
    const data = error?.response?.data;
    if (!data) return error?.message || fallback;
    if (typeof data === 'string') return data;
    return data?.message || data?.error || (() => {
        try {
            return JSON.stringify(data);
        } catch {
            return fallback;
        }
    })();
};

const LOCATION_TYPES = ['PROVINCE', 'DISTRICT', 'SECTOR', 'CELL', 'VILLAGE'];

const Locations = () => {
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [type, setType] = useState('PROVINCE');
    const [locations, setLocations] = useState([]);

    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [locationDetails, setLocationDetails] = useState(null);
    const [locationChildren, setLocationChildren] = useState([]);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const [parentCode, setParentCode] = useState('');

    // Cascading dropdown states
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedSector, setSelectedSector] = useState('');
    const [selectedCell, setSelectedCell] = useState('');
    
    // Options for each dropdown
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [sectors, setSectors] = useState([]);
    const [cells, setCells] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        type: 'PROVINCE'
    });

    const fetchLocations = async () => {
        setLoading(true);
        try {
            const page = await locationService.getByType(type, { page: 0, size: 200 });
            setLocations(page?.content || []);
        } catch (e) {
            toast.error(getErrorMessage(e, 'Failed to fetch locations'));
        } finally {
            setLoading(false);
        }
    };

    // Load provinces (root locations)
    const loadProvinces = async () => {
        try {
            const page = await locationService.getByType('PROVINCE', { page: 0, size: 500 });
            setProvinces(page?.content || []);
        } catch (e) {
            setProvinces([]);
        }
    };

    // Load districts filtered by selected province
    const loadDistricts = async (provinceCode) => {
        if (!provinceCode) {
            setDistricts([]);
            return;
        }
        try {
            const data = await locationService.getChildren(provinceCode);
            setDistricts(data || []);
        } catch (e) {
            setDistricts([]);
        }
    };

    // Load sectors filtered by selected district
    const loadSectors = async (districtCode) => {
        if (!districtCode) {
            setSectors([]);
            return;
        }
        try {
            const data = await locationService.getChildren(districtCode);
            setSectors(data || []);
        } catch (e) {
            setSectors([]);
        }
    };

    // Load cells filtered by selected sector
    const loadCells = async (sectorCode) => {
        if (!sectorCode) {
            setCells([]);
            return;
        }
        try {
            const data = await locationService.getChildren(sectorCode);
            setCells(data || []);
        } catch (e) {
            setCells([]);
        }
    };

    useEffect(() => {
        fetchLocations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [type]);

    useEffect(() => {
        // keep modal form type in sync with selected type
        setFormData((p) => ({ ...p, type }));
        setParentCode('');
        // Reset cascading dropdowns
        setSelectedProvince('');
        setSelectedDistrict('');
        setSelectedSector('');
        setSelectedCell('');
        setDistricts([]);
        setSectors([]);
        setCells([]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [type]);

    // Load provinces when modal opens
    useEffect(() => {
        if (showModal) {
            loadProvinces();
        }
    }, [showModal]);

    // Handle province selection - load districts
    useEffect(() => {
        if (selectedProvince) {
            loadDistricts(selectedProvince);
            setSelectedDistrict('');
            setSelectedSector('');
            setSelectedCell('');
            setSectors([]);
            setCells([]);
        } else {
            setDistricts([]);
        }
    }, [selectedProvince]);

    // Handle district selection - load sectors
    useEffect(() => {
        if (selectedDistrict) {
            loadSectors(selectedDistrict);
            setSelectedSector('');
            setSelectedCell('');
            setCells([]);
        } else {
            setSectors([]);
        }
    }, [selectedDistrict]);

    // Handle sector selection - load cells
    useEffect(() => {
        if (selectedSector) {
            loadCells(selectedSector);
            setSelectedCell('');
        } else {
            setCells([]);
        }
    }, [selectedSector]);

    // Update parentCode based on the final selection
    useEffect(() => {
        if (formData.type === 'DISTRICT') {
            setParentCode(selectedProvince);
        } else if (formData.type === 'SECTOR') {
            setParentCode(selectedDistrict);
        } else if (formData.type === 'CELL') {
            setParentCode(selectedSector);
        } else if (formData.type === 'VILLAGE') {
            setParentCode(selectedCell);
        }
    }, [formData.type, selectedProvince, selectedDistrict, selectedSector, selectedCell]);

    const filtered = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        if (!q) return locations;
        return locations.filter((l) =>
            l.name?.toLowerCase().includes(q) ||
            l.code?.toLowerCase().includes(q)
        );
    }, [locations, searchTerm]);

    const openAdd = () => {
        setEditing(null);
        setFormData({ name: '', code: '', type });
        setParentCode('');
        // Reset cascading dropdowns
        setSelectedProvince('');
        setSelectedDistrict('');
        setSelectedSector('');
        setSelectedCell('');
        setDistricts([]);
        setSectors([]);
        setCells([]);
        setShowModal(true);
    };

    const openEdit = async (loc) => {
        setEditing(loc);
        setFormData({ name: loc.name || '', code: loc.code || '', type: loc.type || type });
        setParentCode(loc.parent?.code || '');
        
        // Reset cascading dropdowns
        setSelectedProvince('');
        setSelectedDistrict('');
        setSelectedSector('');
        setSelectedCell('');
        setDistricts([]);
        setSectors([]);
        setCells([]);
        
        // If editing, load the hierarchy to populate dropdowns
        if (loc.parent) {
            try {
                // Traverse up to find province, district, sector, cell
                let current = loc.parent;
                const hierarchy = [];
                
                while (current) {
                    hierarchy.unshift(current);
                    if (current.parent) {
                        const parentData = await locationService.getByCode(current.parent.code);
                        if (parentData) {
                            current = parentData;
                        } else {
                            break;
                        }
                    } else {
                        break;
                    }
                }
                
                // Set the hierarchy based on types
                hierarchy.forEach((loc) => {
                    if (loc.type === 'PROVINCE') {
                        setSelectedProvince(loc.code);
                    } else if (loc.type === 'DISTRICT') {
                        setSelectedDistrict(loc.code);
                    } else if (loc.type === 'SECTOR') {
                        setSelectedSector(loc.code);
                    } else if (loc.type === 'CELL') {
                        setSelectedCell(loc.code);
                    }
                });
            } catch (e) {
                console.error('Error loading location hierarchy:', e);
            }
        }
        
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                await locationService.update(editing.code, {
                    name: formData.name,
                    code: formData.code,
                    type: formData.type
                });
                toast.success('Location updated');
            } else {
                const payload = { name: formData.name, code: formData.code, type: formData.type };
                if (formData.type === 'PROVINCE') {
                    await locationService.createProvince(payload);
                } else {
                    if (!parentCode) {
                        toast.error('Parent is required for this type');
                        return;
                    }
                    await locationService.createChild(parentCode, payload);
                }
                toast.success('Location saved');
            }
            setShowModal(false);
            fetchLocations();
        } catch (e) {
            toast.error(getErrorMessage(e, 'Operation failed'));
        }
    };

    const handleDelete = async (code) => {
        if (!confirm('Delete this location?')) return;
        try {
            await locationService.delete(code);
            toast.success('Location deleted');
            fetchLocations();
        } catch (e) {
            toast.error(getErrorMessage(e, 'Failed to delete location'));
        }
    };

    const handleLocationClick = async (loc) => {
        setSelectedLocation(loc);
        setLoadingDetails(true);
        setShowDetailModal(true);
        try {
            // Fetch full location details
            const details = await locationService.getByCode(loc.code);
            setLocationDetails(details);
            
            // Fetch children if available
            try {
                const children = await locationService.getChildren(loc.code);
                setLocationChildren(children || []);
            } catch (e) {
                setLocationChildren([]);
            }
        } catch (e) {
            toast.error(getErrorMessage(e, 'Failed to load location details'));
            setLocationDetails(null);
        } finally {
            setLoadingDetails(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Locations</h1>
                    <p className="text-gray-600 mt-1">Manage province → village hierarchy</p>
                </div>
                <button
                    onClick={openAdd}
                    className="flex items-center gap-2 bg-emerald-700 text-white px-4 py-2 rounded-lg hover:bg-emerald-800 transition"
                >
                    <Plus className="h-5 w-5" /> Add Location
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>

                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                        {LOCATION_TYPES.map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <div className="text-center py-8 text-gray-500">Loading...</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No locations found</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">Name</th>
                                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">Code</th>
                                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">Type</th>
                                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">Parent</th>
                                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((loc) => (
                                    <tr 
                                        key={loc.code} 
                                        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                                        onClick={() => handleLocationClick(loc)}
                                    >
                                        <td className="py-3 px-4 flex items-center gap-3">
                                            <div className="h-10 w-10 bg-teal-100 rounded-lg flex items-center justify-center">
                                                <MapPin className="h-5 w-5 text-teal-700" />
                                            </div>
                                            <span className="font-medium text-emerald-700 hover:text-emerald-800">{loc.name}</span>
                                        </td>
                                        <td className="py-3 px-4">{loc.code}</td>
                                        <td className="py-3 px-4">{loc.type}</td>
                                        <td className="py-3 px-4">{loc.parent?.name || '-'}</td>
                                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => openEdit(loc)} className="p-2 hover:bg-gray-100 rounded-lg">
                                                    <Edit2 className="h-4 w-4 text-gray-600" />
                                                </button>
                                                <button onClick={() => handleDelete(loc.code)} className="p-2 hover:bg-red-50 rounded-lg">
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">{editing ? 'Edit Location' : 'Add Location'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => {
                                        const nextType = e.target.value;
                                        setFormData((p) => ({ ...p, type: nextType }));
                                        setParentCode('');
                                        // Reset cascading dropdowns when type changes
                                        setSelectedProvince('');
                                        setSelectedDistrict('');
                                        setSelectedSector('');
                                        setSelectedCell('');
                                        setDistricts([]);
                                        setSectors([]);
                                        setCells([]);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    {LOCATION_TYPES.map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Cascading dropdowns based on location type */}
                            {formData.type === 'DISTRICT' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Province *</label>
                                    <select
                                        value={selectedProvince}
                                        onChange={(e) => setSelectedProvince(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        required
                                    >
                                        <option value="">Select Province</option>
                                        {provinces.map((p) => (
                                            <option key={p.code} value={p.code}>{p.name} ({p.code})</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {formData.type === 'SECTOR' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Province *</label>
                                        <select
                                            value={selectedProvince}
                                            onChange={(e) => setSelectedProvince(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            required
                                        >
                                            <option value="">Select Province</option>
                                            {provinces.map((p) => (
                                                <option key={p.code} value={p.code}>{p.name} ({p.code})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
                                        <select
                                            value={selectedDistrict}
                                            onChange={(e) => setSelectedDistrict(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            required
                                            disabled={!selectedProvince}
                                        >
                                            <option value="">{selectedProvince ? 'Select District' : 'Select Province first'}</option>
                                            {districts.map((d) => (
                                                <option key={d.code} value={d.code}>{d.name} ({d.code})</option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            )}

                            {formData.type === 'CELL' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Province *</label>
                                        <select
                                            value={selectedProvince}
                                            onChange={(e) => setSelectedProvince(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            required
                                        >
                                            <option value="">Select Province</option>
                                            {provinces.map((p) => (
                                                <option key={p.code} value={p.code}>{p.name} ({p.code})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
                                        <select
                                            value={selectedDistrict}
                                            onChange={(e) => setSelectedDistrict(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            required
                                            disabled={!selectedProvince}
                                        >
                                            <option value="">{selectedProvince ? 'Select District' : 'Select Province first'}</option>
                                            {districts.map((d) => (
                                                <option key={d.code} value={d.code}>{d.name} ({d.code})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Sector *</label>
                                        <select
                                            value={selectedSector}
                                            onChange={(e) => setSelectedSector(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            required
                                            disabled={!selectedDistrict}
                                        >
                                            <option value="">{selectedDistrict ? 'Select Sector' : 'Select District first'}</option>
                                            {sectors.map((s) => (
                                                <option key={s.code} value={s.code}>{s.name} ({s.code})</option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            )}

                            {formData.type === 'VILLAGE' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Province *</label>
                                        <select
                                            value={selectedProvince}
                                            onChange={(e) => setSelectedProvince(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            required
                                        >
                                            <option value="">Select Province</option>
                                            {provinces.map((p) => (
                                                <option key={p.code} value={p.code}>{p.name} ({p.code})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
                                        <select
                                            value={selectedDistrict}
                                            onChange={(e) => setSelectedDistrict(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            required
                                            disabled={!selectedProvince}
                                        >
                                            <option value="">{selectedProvince ? 'Select District' : 'Select Province first'}</option>
                                            {districts.map((d) => (
                                                <option key={d.code} value={d.code}>{d.name} ({d.code})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Sector *</label>
                                        <select
                                            value={selectedSector}
                                            onChange={(e) => setSelectedSector(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            required
                                            disabled={!selectedDistrict}
                                        >
                                            <option value="">{selectedDistrict ? 'Select Sector' : 'Select District first'}</option>
                                            {sectors.map((s) => (
                                                <option key={s.code} value={s.code}>{s.name} ({s.code})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Cell *</label>
                                        <select
                                            value={selectedCell}
                                            onChange={(e) => setSelectedCell(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            required
                                            disabled={!selectedSector}
                                        >
                                            <option value="">{selectedSector ? 'Select Cell' : 'Select Sector first'}</option>
                                            {cells.map((c) => (
                                                <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData((p) => ({ ...p, code: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    required
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800"
                                >
                                    {editing ? 'Update' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Location Detail Modal */}
            {showDetailModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDetailModal(false)}>
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-900">Location Details</h2>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="h-5 w-5 text-gray-600" />
                            </button>
                        </div>

                        {loadingDetails ? (
                            <div className="text-center py-8 text-gray-500">Loading details...</div>
                        ) : locationDetails ? (
                            <div className="space-y-4">
                                <div className="bg-emerald-50 rounded-lg p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                                            <MapPin className="h-6 w-6 text-emerald-700" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">{locationDetails.name}</h3>
                                            <p className="text-sm text-gray-600">{locationDetails.code}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-600 mb-1">Type</p>
                                        <p className="font-semibold text-gray-900">{locationDetails.type}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-600 mb-1">Code</p>
                                        <p className="font-semibold text-gray-900">{locationDetails.code}</p>
                                    </div>
                                </div>

                                {locationDetails.parent && (
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-600 mb-2">Parent Location</p>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-blue-600" />
                                            <span className="font-semibold text-blue-900 cursor-pointer hover:text-blue-700"
                                                  onClick={() => locationDetails.parent && handleLocationClick(locationDetails.parent)}>
                                                {locationDetails.parent.name} ({locationDetails.parent.code})
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {locationChildren.length > 0 && (
                                    <div className="bg-purple-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-600 mb-2">Child Locations ({locationChildren.length})</p>
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {locationChildren.map((child) => (
                                                <div 
                                                    key={child.code} 
                                                    className="flex items-center gap-2 p-2 bg-white rounded hover:bg-purple-100 cursor-pointer"
                                                    onClick={() => handleLocationClick(child)}
                                                >
                                                    <MapPin className="h-4 w-4 text-purple-600" />
                                                    <span className="font-medium text-purple-900">{child.name}</span>
                                                    <span className="text-xs text-gray-500">({child.code})</span>
                                                    <span className="text-xs text-gray-400 ml-auto">{child.type}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {locationChildren.length === 0 && (
                                    <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
                                        No child locations
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">Failed to load location details</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Locations;


