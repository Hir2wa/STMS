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