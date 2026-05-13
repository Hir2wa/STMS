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