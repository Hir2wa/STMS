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
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            student.status === "ONBUS"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {student.status || "-"}
                        </span>
                      </td>
                      <td
                        className="py-3 px-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openAssignBus(student)}
                            className="p-2 hover:bg-emerald-50 rounded-lg"
                            title="Assign bus"
                          >
                            <BusIcon className="h-4 w-4 text-emerald-700" />
                          </button>
                          <button
                            onClick={() => handleEdit(student)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                          >
                            <Edit2 className="h-4 w-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(student.id)}
                            className="p-2 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex-shrink-0 mt-4 pt-4 border-t border-gray-200">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                pageSize={pageSize}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setCurrentPage(0);
                }}
                totalElements={totalElements}
              />
            </div>
          </>
        )}
      </div>

      {showAssignBusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Assign Bus</h2>
            <p className="text-sm text-gray-600 mb-4">
              Student:{" "}
              <span className="font-medium">{assigningStudent?.name}</span>
            </p>
            <form onSubmit={handleAssignBus} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bus
                </label>
                <select
                  value={selectedBusId}
                  onChange={(e) => setSelectedBusId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  <option value="">Select bus</option>
                  {buses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.plateNumber} (cap: {b.capacity})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignBusModal(false);
                    setAssigningStudent(null);
                    setSelectedBusId("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800"
                >
                  Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] flex flex-col">
            <h2 className="text-xl font-bold mb-4">
              {editingStudent ? "Edit Student" : "Add New Student"}
            </h2>

            {/* Progress Indicator */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-600">
                  Step {formStep} of 4
                </span>
                <span className="text-xs text-gray-500">
                  {Math.round((formStep / 4) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(formStep / 4) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-2">
                <span
                  className={`text-xs ${formStep >= 1 ? "text-emerald-600 font-medium" : "text-gray-400"}`}
                >
                  Basic Info
                </span>
                <span
                  className={`text-xs ${formStep >= 2 ? "text-emerald-600 font-medium" : "text-gray-400"}`}
                >
                  Transport
                </span>
                <span
                  className={`text-xs ${formStep >= 3 ? "text-emerald-600 font-medium" : "text-gray-400"}`}
                >
                  Location
                </span>
                <span
                  className={`text-xs ${formStep >= 4 ? "text-emerald-600 font-medium" : "text-gray-400"}`}
                >
                  Review
                </span>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {/* Step 1: Basic Information */}
                {formStep === 1 && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Student Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                        disabled={!!editingStudent}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        An OTP will be sent for password setup.
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Class *
                      </label>
                      <input
                        type="text"
                        value={formData.className}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            className: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                  </>
                )}

                {/* Step 2: Transport Details */}
                {formStep === 2 && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pick Up Point
                      </label>
                      <input
                        type="text"
                        value={formData.pickUpPoint}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            pickUpPoint: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Enter pickup location"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Drop Off Point
                      </label>
                      <input
                        type="text"
                        value={formData.dropOffPoint}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dropOffPoint: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Enter dropoff location"
                      />
                    </div>
                  </>
                )}

                {/* Step 3: Location */}
                {formStep === 3 && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Province *
                      </label>
                      <select
                        value={provinceCode}
                        onChange={(e) => handleProvinceChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      >
                        <option value="">Select province</option>
                        {provinces.map((p) => (
                          <option key={p.code} value={p.code}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        District *
                      </label>
                      <select
                        value={districtCode}
                        onChange={(e) => handleDistrictChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        disabled={!provinceCode}
                        required
                      >
                        <option value="">Select district</option>
                        {districts.map((d) => (
                          <option key={d.code} value={d.code}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sector *
                      </label>
                      <select
                        value={sectorCode}
                        onChange={(e) => handleSectorChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        disabled={!districtCode}
                        required
                      >
                        <option value="">Select sector</option>
                        {sectors.map((s) => (
                          <option key={s.code} value={s.code}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cell *
                      </label>
                      <select
                        value={cellCode}
                        onChange={(e) => handleCellChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        disabled={!sectorCode}
                        required
                      >
                        <option value="">Select cell</option>
                        {cells.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Village *
                      </label>
                      <select
                        value={villageCode}
                        onChange={(e) => setVillageCode(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        disabled={!cellCode}
                        required
                      >
                        <option value="">Select village</option>
                        {villages.map((v) => (
                          <option key={v.code} value={v.code}>
                            {v.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {/* Step 4: Status & Review */}
                {formStep === 4 && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="ONBUS">On Bus</option>
                        <option value="DROPPEDOFF">Dropped Off</option>
                        <option value="ABSENT">Absent</option>
                      </select>
                    </div>
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        Review Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span className="font-medium">
                            {formData.name || "Not set"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium">
                            {formData.email || "Not set"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Class:</span>
                          <span className="font-medium">
                            {formData.className || "Not set"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Pick Up:</span>
                          <span className="font-medium">
                            {formData.pickUpPoint || "Not set"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Drop Off:</span>
                          <span className="font-medium">
                            {formData.dropOffPoint || "Not set"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className="font-medium">{formData.status}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Assigned Bus:</span>
                          <span className="font-medium">
                            {formData.busId
                              ? buses.find(
                                  (b) =>
                                    String(b.id) === String(formData.busId),
                                )?.plateNumber
                              : "None"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-3 pt-4 mt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                {formStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    Previous
                  </button>
                )}
                {formStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800"
                  >
                    {editingStudent ? "Update" : "Add Student"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Detail Modal */}
      {showDetailModal && selectedStudent && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Student Details
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {loadingStudentDetails ? (
              <div className="text-center py-8 text-gray-500">
                Loading details...
              </div>
            ) : (
              <div className="space-y-4">
                {/* Student Basic Info */}
                <div className="bg-emerald-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <GraduationCap className="h-6 w-6 text-emerald-700" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {selectedStudent.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {selectedStudent.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Student Information Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <School className="h-4 w-4 text-gray-600" />
                      <p className="text-sm text-gray-600">Class</p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {selectedStudent.className || "Not set"}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${selectedStudent.status === "ONBUS" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
                    >
                      {selectedStudent.status || "ABSENT"}
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Pick Up Point</p>
                    <p className="font-semibold text-gray-900">
                      {selectedStudent.pickUpPoint || "Not set"}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Drop Off Point</p>
                    <p className="font-semibold text-gray-900">
                      {selectedStudent.dropOffPoint || "Not set"}
                    </p>
                  </div>
                </div>

                {/* Bus Information */}
                {selectedStudent.bus && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BusIcon className="h-5 w-5 text-blue-600" />
                      <p className="text-sm font-semibold text-gray-700">
                        Bus Information
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Plate Number:</span>{" "}
                        {selectedStudent.bus.plateNumber}
                      </p>
                      {selectedStudent.bus.capacity && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Capacity:</span>{" "}
                          {selectedStudent.bus.capacity}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Parent Information */}
                {selectedStudent.parent && (
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-5 w-5 text-purple-600" />
                      <p className="text-sm font-semibold text-gray-700">
                        Parent Information
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Name:</span>{" "}
                        {selectedStudent.parent.fullNames || "N/A"}
                      </p>
                      {selectedStudent.parent.email && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Email:</span>{" "}
                          {selectedStudent.parent.email}
                        </p>
                      )}
                      {selectedStudent.parent.phoneNumber && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Phone:</span>{" "}
                          {selectedStudent.parent.phoneNumber}
                        </p>
                      )}