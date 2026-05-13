import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  GraduationCap,
  Bus as BusIcon,
  MapPin,
  X,
  User,
  Mail,
  Phone,
  School,
} from "lucide-react";
import { studentService } from "../../services/studentService";
import { busService } from "../../services/busService";
import { locationService } from "../../services/locationService";
import Pagination from "../../components/Pagination";
import toast from "react-hot-toast";

const getErrorMessage = (error, fallback = "Operation failed") => {
  const data = error?.response?.data;
  if (!data) return error?.message || fallback;
  if (typeof data === "string") return data;
  // Spring Boot default error shape: {timestamp,status,error,path}
  return (
    data?.message ||
    data?.error ||
    (() => {
      try {
        return JSON.stringify(data);
      } catch {
        return fallback;
      }
    })()
  );
};

const Students = () => {
  const [students, setStudents] = useState([]);
  const [buses, setBuses] = useState([]);

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [cells, setCells] = useState([]);
  const [villages, setVillages] = useState([]);

  const [provinceCode, setProvinceCode] = useState("");
  const [districtCode, setDistrictCode] = useState("");
  const [sectorCode, setSectorCode] = useState("");
  const [cellCode, setCellCode] = useState("");
  const [villageCode, setVillageCode] = useState("");

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState(""); // Selected location code for filtering
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [showAssignBusModal, setShowAssignBusModal] = useState(false);
  const [assigningStudent, setAssigningStudent] = useState(null);
  const [selectedBusId, setSelectedBusId] = useState("");
  const [formStep, setFormStep] = useState(1);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentLocationHierarchy, setStudentLocationHierarchy] = useState([]);
  const [loadingStudentDetails, setLoadingStudentDetails] = useState(false);

  // Location filter dropdowns (separate from form location dropdowns)
  const [filterProvince, setFilterProvince] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterSector, setFilterSector] = useState("");
  const [filterCell, setFilterCell] = useState("");
  const [filterVillage, setFilterVillage] = useState("");
  const [filterDistricts, setFilterDistricts] = useState([]);
  const [filterSectors, setFilterSectors] = useState([]);
  const [filterCells, setFilterCells] = useState([]);
  const [filterVillages, setFilterVillages] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    className: "",
    pickUpPoint: "",
    dropOffPoint: "",
    status: "ABSENT",
  });

  useEffect(() => {
    fetchStudents();
    fetchBuses();
    fetchProvinces();
  }, [currentPage, pageSize]);

  // Check if we came from global search (only on initial mount)
  useEffect(() => {
    const globalSearchQuery = sessionStorage.getItem("globalSearchQuery");
    const globalSearchType = sessionStorage.getItem("globalSearchType");
    if (globalSearchQuery && globalSearchType === "students") {
      setSearchTerm(globalSearchQuery);
      // Clear the session storage
      sessionStorage.removeItem("globalSearchQuery");
      sessionStorage.removeItem("globalSearchType");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Reset to first page when search term or location filter changes
    setCurrentPage(0);
    fetchStudents();
  }, [searchTerm, locationFilter]);

  // Load filter districts when province is selected
  useEffect(() => {
    if (filterProvince) {
      locationService.getChildren(filterProvince).then((data) => {
        setFilterDistricts((data || []).filter((l) => l.type === "DISTRICT"));
      });
    } else {
      setFilterDistricts([]);
      setFilterDistrict("");
    }
  }, [filterProvince]);

  // Load filter sectors when district is selected
  useEffect(() => {
    if (filterDistrict) {
      locationService.getChildren(filterDistrict).then((data) => {
        setFilterSectors((data || []).filter((l) => l.type === "SECTOR"));
      });
    } else {
      setFilterSectors([]);
      setFilterSector("");
    }
  }, [filterDistrict]);

  // Load filter cells when sector is selected
  useEffect(() => {
    if (filterSector) {
      locationService.getChildren(filterSector).then((data) => {
        setFilterCells((data || []).filter((l) => l.type === "CELL"));
      });
    } else {
      setFilterCells([]);
      setFilterCell("");
    }
  }, [filterSector]);

  // Load filter villages when cell is selected
  useEffect(() => {
    if (filterCell) {
      locationService.getChildren(filterCell).then((data) => {
        setFilterVillages((data || []).filter((l) => l.type === "VILLAGE"));
      });
    } else {
      setFilterVillages([]);
      setFilterVillage("");
    }
  }, [filterCell]);

  // Update location filter based on selected location
  useEffect(() => {
    if (filterVillage) {
      setLocationFilter(filterVillage);
    } else if (filterCell) {
      setLocationFilter(filterCell);
    } else if (filterSector) {
      setLocationFilter(filterSector);
    } else if (filterDistrict) {
      setLocationFilter(filterDistrict);
    } else if (filterProvince) {
      setLocationFilter(filterProvince);
    } else {
      setLocationFilter("");
    }
  }, [filterProvince, filterDistrict, filterSector, filterCell, filterVillage]);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !token.trim()) {
        setLoading(false);
        return;
      }
      setLoading(true);
      let data;

      // If location filter is set, search students by location
      if (locationFilter) {
        data = await studentService.getByLocationCodePaginated(
          locationFilter,
          currentPage,
          pageSize,
          "name",
          "asc",
        );
      } else if (searchTerm.trim()) {
        data = await studentService.searchPaginated(
          searchTerm,
          currentPage,
          pageSize,
          "name",
          "asc",
        );
      } else {
        data = await studentService.getAllPaginated(
          currentPage,
          pageSize,
          "name",
          "asc",
        );
      }

      setStudents(data?.content || []);
      setTotalPages(data?.totalPages || 0);
      setTotalElements(data?.totalElements || 0);
    } catch (error) {
      if (
        error.message?.includes("authentication") ||
        error.message?.includes("Session expired")
      ) {
        // Don't show error toast, redirect will happen
        setLoading(false);
        return;
      }
      toast.error("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  const clearLocationFilter = () => {
    setFilterProvince("");
    setFilterDistrict("");
    setFilterSector("");
    setFilterCell("");
    setFilterVillage("");
    setFilterDistricts([]);
    setFilterSectors([]);
    setFilterCells([]);
    setFilterVillages([]);
    setLocationFilter("");
  };

  const handleStudentClick = async (student) => {
    setSelectedStudent(student);
    setLoadingStudentDetails(true);
    setShowDetailModal(true);
    try {
      // Build location hierarchy
      const hierarchy = [];
      if (student.location) {
        let current = student.location;
        while (current) {
          hierarchy.unshift(current);
          if (current.parent) {
            try {
              const parentData = await locationService.getByCode(
                current.parent.code,
              );
              if (parentData) {
                current = parentData;
              } else {
                break;
              }
            } catch (e) {
              break;
            }
          } else {
            break;
          }
        }
      }
      setStudentLocationHierarchy(hierarchy);
    } catch (e) {
      toast.error("Failed to load student location details");
      setStudentLocationHierarchy([]);
    } finally {
      setLoadingStudentDetails(false);
    }
  };

  const fetchBuses = async () => {
    try {
      const data = await busService.getAll();
      setBuses(data || []);
    } catch (error) {
      console.error("Failed to fetch buses");
    }
  };

  const fetchProvinces = async () => {
    try {
      const data = await locationService.getRoots();
      setProvinces((data || []).filter((l) => l.type === "PROVINCE"));
      if (!data || data.length === 0) {
        toast.error("No provinces found. Add locations in Admin → Locations.");
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to fetch provinces"));
    }
  };

  const resetLocationBelowProvince = () => {
    setDistricts([]);
    setSectors([]);
    setCells([]);
    setVillages([]);
    setDistrictCode("");
    setSectorCode("");
    setCellCode("");
    setVillageCode("");
  };

  const resetLocationBelowDistrict = () => {
    setSectors([]);
    setCells([]);
    setVillages([]);
    setSectorCode("");
    setCellCode("");
    setVillageCode("");
  };

  const resetLocationBelowSector = () => {
    setCells([]);
    setVillages([]);
    setCellCode("");
    setVillageCode("");
  };

  const resetLocationBelowCell = () => {
    setVillages([]);
    setVillageCode("");
  };

  const handleProvinceChange = async (code) => {
    setProvinceCode(code);
    resetLocationBelowProvince();
    if (!code) return;
    try {
      const kids = await locationService.getChildren(code);
      setDistricts((kids || []).filter((l) => l.type === "DISTRICT"));
    } catch (e) {
      toast.error("Failed to load districts");
    }
  };

  const handleDistrictChange = async (code) => {
    setDistrictCode(code);
    resetLocationBelowDistrict();
    if (!code) return;
    try {
      const kids = await locationService.getChildren(code);
      setSectors((kids || []).filter((l) => l.type === "SECTOR"));
    } catch (e) {
      toast.error("Failed to load sectors");
    }
  };

  const handleSectorChange = async (code) => {
    setSectorCode(code);
    resetLocationBelowSector();
    if (!code) return;
    try {
      const kids = await locationService.getChildren(code);
      setCells((kids || []).filter((l) => l.type === "CELL"));
    } catch (e) {
      toast.error("Failed to load cells");
    }
  };

  const handleCellChange = async (code) => {
    setCellCode(code);
    resetLocationBelowCell();
    if (!code) return;
    try {
      const kids = await locationService.getChildren(code);
      setVillages((kids || []).filter((l) => l.type === "VILLAGE"));
    } catch (e) {
      toast.error("Failed to load villages");
    }
  };

  const hydrateLocationForEdit = async (anyCode) => {
    if (!anyCode) return;
    try {
      const codesByType = {};
      let currentCode = anyCode;
      let guard = 0;

      while (currentCode && guard < 10) {
        const loc = await locationService.getByCode(currentCode);
        if (!loc) break;
        if (loc.type && loc.code) {
          codesByType[loc.type] = loc.code;
        }
        currentCode = loc.parent?.code || "";
        guard += 1;
      }

      const p = codesByType.PROVINCE || "";
      const d = codesByType.DISTRICT || "";
      const s = codesByType.SECTOR || "";
      const c = codesByType.CELL || "";
      const v = codesByType.VILLAGE || anyCode;

      setProvinceCode(p);
      if (p) {
        const dKids = await locationService.getChildren(p);
        setDistricts((dKids || []).filter((l) => l.type === "DISTRICT"));
      }

      setDistrictCode(d);
      if (d) {
        const sKids = await locationService.getChildren(d);
        setSectors((sKids || []).filter((l) => l.type === "SECTOR"));
      }

      setSectorCode(s);
      if (s) {
        const cKids = await locationService.getChildren(s);
        setCells((cKids || []).filter((l) => l.type === "CELL"));
      }

      setCellCode(c);
      if (c) {
        const vKids = await locationService.getChildren(c);
        setVillages((vKids || []).filter((l) => l.type === "VILLAGE"));
      }

      setVillageCode(v);
    } catch (e) {
      // ignore; editing should still work
    }
  };

  const handleNext = () => {
    // Validate current step before proceeding
    if (formStep === 1) {
      if (!formData.name || !formData.email || !formData.className) {
        toast.error("Please fill in all required fields (Name, Email, Class)");
        return;
      }
    } else if (formStep === 2) {
      // Step 2 has optional fields, so no validation needed
    } else if (formStep === 3) {
      if (!villageCode) {
        toast.error("Please select a location (Province through Village)");
        return;
      }
    }
    setFormStep(formStep + 1);
  };

  const handlePrevious = () => {
    setFormStep(formStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!villageCode) {
        toast.error("Student location (village) is required");
        return;
      }

      const payload = {
        ...formData,
        location: { code: villageCode },
      };

      if (editingStudent) {
        await studentService.update(editingStudent.id, payload);
        toast.success("Student updated successfully");
      } else {
        await studentService.create(payload);
        toast.success("Student added successfully");
        toast("A password setup OTP was sent to the student email.");
      }
      setShowModal(false);
      setEditingStudent(null);
      setFormStep(1);
      setFormData({
        name: "",
        email: "",
        className: "",
        pickUpPoint: "",
        dropOffPoint: "",
        status: "ABSENT",
      });
      setProvinceCode("");
      resetLocationBelowProvince();
      setCurrentPage(0);
      fetchStudents();
    } catch (error) {
      toast.error(getErrorMessage(error, "Operation failed"));
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name || "",
      email: student.email || "",
      className: student.className || "",
      pickUpPoint: student.pickUpPoint || "",
      dropOffPoint: student.dropOffPoint || "",
      status: student.status || "ABSENT",
    });
    setProvinceCode("");
    resetLocationBelowProvince();
    hydrateLocationForEdit(student.location?.code);
    setFormStep(1);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    try {
      await studentService.delete(id);
      toast.success("Student deleted successfully");
      setCurrentPage(0);
      fetchStudents();
    } catch (error) {
      toast.error("Failed to delete student");
    }
  };

  const openAssignBus = (student) => {
    setAssigningStudent(student);
    setSelectedBusId(student?.bus?.id ? String(student.bus.id) : "");
    setShowAssignBusModal(true);
  };

  const handleAssignBus = async (e) => {
    e.preventDefault();
    if (!assigningStudent?.id) return;
    if (!selectedBusId) {
      toast.error("Please select a bus");
      return;
    }
    try {
      await studentService.assignBus(
        assigningStudent.id,
        Number(selectedBusId),
      );
      toast.success("Bus assigned successfully");
      setShowAssignBusModal(false);
      setAssigningStudent(null);
      setSelectedBusId("");
      setCurrentPage(0);
      fetchStudents();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to assign bus"));
    }
  };

  // No need for client-side filtering when using server-side pagination
  const displayStudents = students;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600 mt-1">Manage student records</p>
        </div>
        <button
          onClick={() => {
            setShowModal(true);
            setEditingStudent(null);
            setFormStep(1);
            setFormData({
              name: "",
              email: "",
              className: "",
              pickUpPoint: "",
              dropOffPoint: "",
              status: "ABSENT",
            });
            setProvinceCode("");
            resetLocationBelowProvince();
          }}
          className="flex items-center gap-2 bg-emerald-700 text-white px-4 py-2 rounded-lg hover:bg-emerald-800 transition"
        >
          <Plus className="h-5 w-5" /> Add Student
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-[calc(100vh-200px)]">
        <div className="flex flex-col gap-4 mb-6 flex-shrink-0">
          {/* Search and Location Filter Row */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search students by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            {locationFilter && (
              <button
                onClick={clearLocationFilter}
                className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition"
              >
                <X className="h-4 w-4" />
                Clear Location Filter
              </button>
            )}
          </div>

          {/* Location Filter Dropdowns */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600 font-medium">
                Filter by Location:
              </span>
            </div>
            <select
              value={filterProvince}
              onChange={(e) => setFilterProvince(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            >
              <option value="">All Provinces</option>
              {provinces.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>

            {filterProvince && (
              <select
                value={filterDistrict}
                onChange={(e) => setFilterDistrict(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              >
                <option value="">All Districts</option>
                {filterDistricts.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.name}
                  </option>
                ))}
              </select>
            )}

            {filterDistrict && (
              <select
                value={filterSector}
                onChange={(e) => setFilterSector(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              >
                <option value="">All Sectors</option>
                {filterSectors.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}

            {filterSector && (
              <select
                value={filterCell}
                onChange={(e) => setFilterCell(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              >
                <option value="">All Cells</option>
                {filterCells.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}

            {filterCell && (
              <select
                value={filterVillage}
                onChange={(e) => setFilterVillage(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              >
                <option value="">All Villages</option>
                {filterVillages.map((v) => (
                  <option key={v.code} value={v.code}>
                    {v.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500 flex-1 flex items-center justify-center">
            Loading...
          </div>
        ) : displayStudents.length === 0 ? (
          <div className="text-center py-8 text-gray-500 flex-1 flex items-center justify-center">
            No students found
          </div>
        ) : (
          <>
            <div className="overflow-auto flex-1 min-h-0">
              <table className="w-full">
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold bg-white">
                      Name
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold bg-white">
                      Email
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold bg-white">
                      Class
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold bg-white">
                      Pick Up
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold bg-white">
                      Drop Off
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold bg-white">
                      Location
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold bg-white">
                      Bus
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold bg-white">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold bg-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleStudentClick(student)}
                    >
                      <td className="py-3 px-4 flex items-center gap-3">
                        <div className="h-10 w-10 bg-lime-100 rounded-lg flex items-center justify-center">
                          <GraduationCap className="h-5 w-5 text-lime-700" />
                        </div>
                        <span className="font-medium text-emerald-700 hover:text-emerald-800">
                          {student.name}
                        </span>
                      </td>
                      <td className="py-3 px-4">{student.email || "-"}</td>
                      <td className="py-3 px-4">{student.className || "-"}</td>
                      <td className="py-3 px-4">
                        {student.pickUpPoint || "-"}
                      </td>
                      <td className="py-3 px-4">
                        {student.dropOffPoint || "-"}
                      </td>
                      <td className="py-3 px-4">
                        {student.location?.name ? (
                          <span className="text-blue-600 hover:text-blue-800 font-medium">
                            {student.location.name}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {student.bus?.plateNumber || "-"}
                      </td>