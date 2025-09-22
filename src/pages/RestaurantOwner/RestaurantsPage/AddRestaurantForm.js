import React, { useState } from "react";
import { useForm } from "react-hook-form";
import api from "../../../api";
import Toast from "../../../utils/toast";
import MapPickerModal from "../../../components/Map/MapPickerModal";
import "./AddRestaurantForm.css";

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const cuisineOptions = [
  "Sri Lankan",
  "Indian",
  "Chinese",
  "Italian",
  "Mexican",
  "Japanese",
  "Western",
  "Thai",
  "Korean",
  "French",
  "American",
];

const AddRestaurantForm = ({ show, onClose, ownerID }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      Monday_open: "08:00",
      Monday_close: "21:00",
      Tuesday_open: "08:00",
      Tuesday_close: "21:00",
      Wednesday_open: "08:00",
      Wednesday_close: "21:00",
      Thursday_open: "08:00",
      Thursday_close: "21:00",
      Friday_open: "08:00",
      Friday_close: "21:00",
      Saturday_open: "10:00",
      Saturday_close: "23:00",
      Sunday_open: "10:00",
      Sunday_close: "23:00",
    },
  });

  const [fileError, setFileError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const [customCuisines, setCustomCuisines] = useState("");

  const onSubmit = async (data) => {
    setFileError("");

    const licenseFile = data.licenseFile[0];
    const restaurantImage = data.restaurantImage[0];
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];

    if (!licenseFile || !allowedTypes.includes(licenseFile.type)) {
      setFileError("Invalid license file type. Only JPEG, PNG, and PDF allowed.");
      return;
    }

    if (!restaurantImage || !["image/jpeg", "image/png"].includes(restaurantImage.type)) {
      setFileError("Invalid image type. Only JPEG and PNG allowed for restaurant image.");
      return;
    }

    if (licenseFile.size > 5 * 1024 * 1024 || restaurantImage.size > 5 * 1024 * 1024) {
      setFileError("File size exceeds 5MB.");
      return;
    }

    if (!coords) {
      Toast({ type: "error", message: "Please select a location on the map." });
      return;
    }

    const formData = new FormData();
    formData.append("restaurantName", data.restaurantName);
    formData.append("branchName", data.branchName);

    const address = {
      fullAddress: data.fullAddress,
      coordinates: {
        lat: coords.lat,
        lng: coords.lng,
      },
    };
    formData.append("address", JSON.stringify(address));

    // Combine selected cuisines and custom cuisines
    const selectedCuisines = Array.isArray(data.cuisineType) ? data.cuisineType : [];
    const customCuisineArray = customCuisines
      .split(",")
      .map((cuisine) => cuisine.trim())
      .filter((cuisine) => cuisine && !selectedCuisines.includes(cuisine));
    const allCuisines = [...selectedCuisines, ...customCuisineArray];
    formData.append("cuisineType", JSON.stringify(allCuisines));

    const operatingHours = {};
    daysOfWeek.forEach((day) => {
      const open = data[`${day}_open`];
      const close = data[`${day}_close`];
      if (open && close) {
        operatingHours[day.toLowerCase()] = { open, close };
      }
    });
    formData.append("operatingHours", JSON.stringify(operatingHours));
    formData.append("restaurantImage", restaurantImage);
    formData.append("licenseFile", licenseFile);
    formData.append("owner", ownerID);

    try {
      setSubmitting(true);
      await api.post("/api/restaurant/restaurants", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      reset();
      setCoords(null);
      setCustomCuisines("");
      onClose();
      Toast({ type: "success", message: "Restaurant created successfully" });
    } catch (err) {
      console.error("Error creating restaurant:", err.response || err);
      const errorMessage = err.response?.data?.message || "Failed to create restaurant";
      Toast({ type: "error", message: errorMessage });
      setFileError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div
        className={`modal fade ${show ? "show d-block" : ""}`}
        tabIndex="-1"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content shadow-lg rounded-3">
            <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title w-100 text-center">Add New Restaurant</h5>
                <button type="button" className="btn-close" onClick={onClose}></button>
              </div>
              <div className="modal-body">
                {/* Basic Info */}
                <div className="mb-3">
                  <label className="form-label">Restaurant Name</label>
                  <input
                    {...register("restaurantName", { required: "Restaurant Name is required." })}
                    className="form-control"
                  />
                  {errors.restaurantName && (
                    <p className="error1 error-restaurantName">{errors.restaurantName.message}</p>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label">Branch Name</label>
                  <input
                    {...register("branchName", { required: "Branch Name is required." })}
                    className="form-control"
                  />
                  {errors.branchName && (
                    <p className="error1 error-branchName">{errors.branchName.message}</p>
                  )}
                </div>

                <hr />

                {/* Address Info */}
                <div className="mb-3">
                  <label className="form-label">Full Address</label>
                  <input
                    {...register("fullAddress", { required: "Full address is required." })}
                    className="form-control"
                  />
                  {errors.fullAddress && (
                    <p className="error1 error-fullAddress">{errors.fullAddress.message}</p>
                  )}
                </div>
                <div className="mb-3">
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => setMapModalOpen(true)}
                  >
                    {coords ? `Lat: ${coords.lat}, Lng: ${coords.lng}` : "Pick Location on Map"}
                  </button>
                </div>

                <hr />

                {/* Cuisine */}
                <div className="mb-3">
                  <label className="form-label">Cuisine Types</label>
                  <select
                    multiple
                    {...register("cuisineType", {
                      validate: (value) =>
                        (Array.isArray(value) && value.length > 0) ||
                        customCuisines.trim().length > 0 ||
                        "At least one cuisine type or custom cuisine is required.",
                    })}
                    className="form-select cuisine-select"
                  >
                    {cuisineOptions.map((cuisine) => (
                      <option key={cuisine} value={cuisine}>
                        {cuisine}
                      </option>
                    ))}
                  </select>
                  {errors.cuisineType && (
                    <p className="error1 error-cuisineType">{errors.cuisineType.message}</p>
                  )}
                  <div className="mt-2">
                    <label className="form-label">Add Custom Cuisines (comma-separated)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g., Fusion, Gourmet"
                      value={customCuisines}
                      onChange={(e) => setCustomCuisines(e.target.value)}
                    />
                  </div>
                </div>

                <hr />

                {/* Operating Hours */}
                <div className="mb-3">
                  <label className="form-label">Operating Hours</label>
                  {daysOfWeek.map((day) => (
                    <div key={day} className="row mb-2 align-items-center">
                      <div className="col-2 fw-bold">{day}</div>
                      <div className="col">
                        <input
                          type="time"
                          {...register(`${day}_open`, {
                            required: `${day} opening time is required.`,
                          })}
                          className="form-control"
                        />
                        {errors[`${day}_open`] && (
                          <p className={`error1 error-${day}-open`}>{errors[`${day}_open`].message}</p>
                        )}
                      </div>
                      <div className="col">
                        <input
                          type="time"
                          {...register(`${day}_close`, {
                            required: `${day} closing time is required.`,
                          })}
                          className="form-control"
                        />
                        {errors[`${day}_close`] && (
                          <p className={`error1 error-${day}-close`}>{errors[`${day}_close`].message}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <hr />

                <div className="mb-3">
                  <label className="form-label">Restaurant Image (JPEG/PNG, max 5MB)</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    {...register("restaurantImage", { required: "Restaurant image is required." })}
                    className="form-control"
                  />
                  {errors.restaurantImage && (
                    <p className="error1 error-restaurantImage">{errors.restaurantImage.message}</p>
                  )}
                </div>

                <hr />

                {/* License Upload */}
                <div className="mb-3">
                  <label className="form-label">License File (JPEG/PNG/PDF, max 5MB)</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    {...register("licenseFile", { required: "License file is required." })}
                    className="form-control"
                  />
                  {errors.licenseFile && (
                    <p className="error1 error-licenseFile">{errors.licenseFile.message}</p>
                  )}
                </div>

                {fileError && <p className="error error-file">{fileError}</p>}
              </div>

              <div className="modal-footer">
                <button type="submit" className="btn btn-success" disabled={submitting}>
                  {submitting ? "Submitting..." : "Add Restaurant"}
                </button>
                <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Map Picker Modal */}
      {mapModalOpen && (
        <MapPickerModal
          show={mapModalOpen}
          onClose={() => setMapModalOpen(false)}
          coords={coords}
          setCoords={setCoords}
        />
      )}
    </>
  );
};

export default AddRestaurantForm;