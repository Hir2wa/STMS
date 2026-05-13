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