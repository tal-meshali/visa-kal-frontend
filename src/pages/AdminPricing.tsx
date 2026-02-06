import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Alert } from "../components/Alert";
import { SignedIn, SignedOut, useUser } from "../components/AuthComponents";
import { BackButton } from "../components/BackButton";
import { Button } from "../components/Button";
import LoadingScreen from "../components/LoadingScreen";
import { useLanguage } from "../contexts/useLanguage";
import { getKeyDownActivateHandler } from "../hooks/useKeyDownActivate";
import { fetchCountries } from "../services/countryService";
import {
  getAllPricing,
  createPricing,
  updatePricing,
  deletePricing,
  type Pricing,
  type CreatePricingRequest,
  type UpdatePricingRequest,
} from "../services/pricingService";
import { getCurrentUser } from "../services/authService";
import "./AdminPricing.css";

interface PricingFormData {
  country_id: string;
  price_usd: string;
  price_ils: string;
  name_en: string;
  name_he: string;
  description_en: string;
  description_he: string;
}

const AdminPricing = () => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { user, isLoaded: isUserLoaded } = useUser();
  const authLoading = !isUserLoaded;

  const [expandedCountries, setExpandedCountries] = useState<Set<string>>(
    new Set()
  );
  const [editingPricingId, setEditingPricingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState<string | null>(null);
  const [formData, setFormData] = useState<PricingFormData>({
    country_id: "",
    price_usd: "",
    price_ils: "",
    name_en: "",
    name_he: "",
    description_en: "",
    description_he: "",
  });
  const [alert, setAlert] = useState<{
    type: "success" | "error" | "info";
    message: string;
    isOpen: boolean;
  }>({
    type: "info",
    message: "",
    isOpen: false,
  });

  // Check if user is admin (ProtectedRoute already verified, but we still need this for queries)
  const { data: userData } = useQuery({
    queryFn: getCurrentUser,
    queryKey: ["user"],
    enabled: !!user,
  });

  const isAdmin = userData?.role === "admin";

  // Fetch countries
  const { data: countriesData, isLoading: countriesLoading } = useQuery({
    queryFn: fetchCountries,
    queryKey: ["countries"],
  });

  // Fetch all pricing plans
  const {
    data: allPricing,
    isLoading: pricingLoading,
    refetch: refetchPricing,
  } = useQuery({
    queryFn: getAllPricing,
    queryKey: ["admin-pricing"],
    enabled: isAdmin,
  });

  // ProtectedRoute handles the redirect, but we keep this as a fallback
  // Redirect if not admin (shouldn't happen due to ProtectedRoute, but safety check)
  useEffect(() => {
    if (!authLoading && user && !isAdmin) {
      navigate("/");
    }
  }, [user, authLoading, isAdmin, navigate]);

  const handleToggleCountry = (countryId: string) => {
    const newExpanded = new Set(expandedCountries);
    if (newExpanded.has(countryId)) {
      newExpanded.delete(countryId);
    } else {
      newExpanded.add(countryId);
    }
    setExpandedCountries(newExpanded);
  };

  const handleEdit = (pricing: Pricing) => {
    setEditingPricingId(pricing.id);
    setFormData({
      country_id: pricing.country_id,
      price_usd: pricing.price_usd.toString(),
      price_ils: pricing.price_ils.toString(),
      name_en: pricing.name_en ?? "",
      name_he: pricing.name_he ?? "",
      description_en: pricing.description_en,
      description_he: pricing.description_he,
    });
    setShowAddForm(null);
  };

  const handleAdd = (countryId: string) => {
    setShowAddForm(countryId);
    setFormData({
      country_id: countryId,
      price_usd: "",
      price_ils: "",
      name_en: "",
      name_he: "",
      description_en: "",
      description_he: "",
    });
    setEditingPricingId(null);
  };

  const handleCancel = () => {
    setShowAddForm(null);
    setEditingPricingId(null);
    setFormData({
      country_id: "",
      price_usd: "",
      price_ils: "",
      name_en: "",
      name_he: "",
      description_en: "",
      description_he: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const priceUsd = parseFloat(formData.price_usd);
      const priceIls = parseFloat(formData.price_ils);

      if (isNaN(priceUsd) || isNaN(priceIls) || priceUsd < 0 || priceIls < 0) {
        setAlert({
          type: "error",
          message: t.admin.pricing.invalidPrices,
          isOpen: true,
        });
        return;
      }

      if (editingPricingId) {
        const updateData: UpdatePricingRequest = {
          country_id: formData.country_id,
          price_usd: priceUsd,
          price_ils: priceIls,
          name_en: formData.name_en,
          name_he: formData.name_he,
          description_en: formData.description_en,
          description_he: formData.description_he,
        };
        await updatePricing(editingPricingId, updateData);
        setAlert({
          type: "success",
          message: t.admin.pricing.updatedSuccess,
          isOpen: true,
        });
      } else {
        const createData: CreatePricingRequest = {
          country_id: formData.country_id,
          price_usd: priceUsd,
          price_ils: priceIls,
          name_en: formData.name_en,
          name_he: formData.name_he,
          description_en: formData.description_en,
          description_he: formData.description_he,
        };
        await createPricing(createData);
        setAlert({
          type: "success",
          message: t.admin.pricing.createdSuccess,
          isOpen: true,
        });
      }

      handleCancel();
      refetchPricing();
    } catch (error) {
      setAlert({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : t.admin.pricing.saveError,
        isOpen: true,
      });
    }
  };

  const handleDelete = async (pricingId: string) => {
    if (!confirm(t.admin.pricing.confirmDelete)) {
      return;
    }

    try {
      await deletePricing(pricingId);
      setAlert({
        type: "success",
        message: t.admin.pricing.deletedSuccess,
        isOpen: true,
      });
      refetchPricing();
    } catch (error) {
      setAlert({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : t.admin.pricing.deleteError,
        isOpen: true,
      });
    }
  };

  const getPricingForCountry = (countryId: string): Pricing[] => {
    if (!allPricing) return [];
    return allPricing.filter((p) => p.country_id === countryId);
  };

  if (authLoading || countriesLoading || pricingLoading) {
    return <LoadingScreen message={t.admin.pricing.loading} />;
  }

  // ProtectedRoute handles admin check, but keep this as safety fallback
  if (!isAdmin) {
    return null;
  }

  const availableCountries = countriesData?.available || [];

  return (
    <>
      <SignedOut>
        <div className="admin-pricing-container">
          <div className="sign-in-prompt">
            <h2 className="sign-in-title">{t.form.signInRequired}</h2>
            <p className="sign-in-message">{t.form.signInMessage}</p>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="admin-pricing-container">
          <BackButton path="/" />
          <div className="admin-pricing-header">
            <h1 className="admin-pricing-title">{t.admin.pricing.title}</h1>
            <p className="admin-pricing-subtitle">{t.admin.pricing.subtitle}</p>
          </div>

          <div className="countries-accordion">
            {availableCountries.map((country) => {
              const isExpanded = expandedCountries.has(country.id);
              const countryPricing = getPricingForCountry(country.id);
              const isAdding = showAddForm === country.id;
              const isEditing = editingPricingId !== null;

              return (
                <div key={country.id} className="country-accordion-item">
                  <div
                    className="country-accordion-header"
                    role="button"
                    tabIndex={0}
                    aria-expanded={isExpanded}
                    onClick={() => handleToggleCountry(country.id)}
                    onKeyDown={getKeyDownActivateHandler(() =>
                      handleToggleCountry(country.id)
                    )}
                  >
                    <div className="country-accordion-title">
                      <img
                        src={country.flag_svg_link}
                        alt={country.name[language]}
                        className="country-flag"
                      />
                      <span>{country.name[language]}</span>
                    </div>
                    <div className="country-accordion-actions">
                      <span className="pricing-count">
                        {countryPricing.length}{" "}
                        {countryPricing.length === 1
                          ? t.admin.pricing.plan
                          : t.admin.pricing.plans}
                      </span>
                      <Button
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAdd(country.id);
                          if (!isExpanded) {
                            handleToggleCountry(country.id);
                          }
                        }}
                        disabled={isEditing}
                      >
                        {t.admin.pricing.addPlan}
                      </Button>
                      <span className="accordion-icon">
                        {isExpanded ? "▼" : "▶"}
                      </span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="country-accordion-content">
                      {(isAdding || isEditing) && (
                        <form
                          className="pricing-form"
                          onSubmit={handleSubmit}
                        >
                          <h3 className="pricing-form-title">
                            {isEditing
                              ? t.admin.pricing.editPlan
                              : t.admin.pricing.addPlan}
                          </h3>
                          <div className="pricing-form-fields">
                            <div className="form-field">
                              <label>{t.admin.pricing.planNameEn}</label>
                              <input
                                type="text"
                                value={formData.name_en}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    name_en: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>
                            <div className="form-field">
                              <label>{t.admin.pricing.planNameHe}</label>
                              <input
                                type="text"
                                value={formData.name_he}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    name_he: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>
                            <div className="form-field">
                              <label>{t.admin.pricing.descriptionEn}</label>
                              <textarea
                                value={formData.description_en}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    description_en: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>
                            <div className="form-field">
                              <label>{t.admin.pricing.descriptionHe}</label>
                              <textarea
                                value={formData.description_he}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    description_he: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>
                            <div className="form-field-row">
                              <div className="form-field">
                                <label>{t.admin.pricing.priceUSD}</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={formData.price_usd}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      price_usd: e.target.value,
                                    })
                                  }
                                  required
                                />
                              </div>
                              <div className="form-field">
                                <label>{t.admin.pricing.priceILS}</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={formData.price_ils}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      price_ils: e.target.value,
                                    })
                                  }
                                  required
                                />
                              </div>
                            </div>
                          </div>
                          <div className="pricing-form-actions">
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={handleCancel}
                            >
                              {t.common.cancel}
                            </Button>
                            <Button type="submit" variant="primary">
                              {t.common.save}
                            </Button>
                          </div>
                        </form>
                      )}

                      <div className="pricing-plans-list">
                        {countryPricing.map((pricing) => (
                          <div key={pricing.id} className="pricing-plan-item">
                            <div className="pricing-plan-info">
                              <h4 className="pricing-plan-name">
                                {language === "he"
                                  ? pricing.name_he
                                  : pricing.name_en}
                              </h4>
                              <p className="pricing-plan-description">
                                {language === "he"
                                  ? pricing.description_he
                                  : pricing.description_en}
                              </p>
                              <div className="pricing-plan-prices">
                                <span>${pricing.price_usd} USD</span>
                                <span>₪{pricing.price_ils} ILS</span>
                              </div>
                            </div>
                            <div className="pricing-plan-actions">
                              <Button
                                variant="secondary"
                                onClick={() => handleEdit(pricing)}
                                disabled={isAdding || isEditing}
                              >
                                {t.common.edit}
                              </Button>
                              <Button
                                variant="secondary"
                                onClick={() => handleDelete(pricing.id)}
                                disabled={isAdding || isEditing}
                                style={{ backgroundColor: "#dc3545", color: "white" }}
                              >
                                {t.common.delete}
                              </Button>
                            </div>
                          </div>
                        ))}

                        {countryPricing.length === 0 && !isAdding && (
                          <div className="empty-state">
                            <p>{t.admin.pricing.noPlans}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </SignedIn>

      <Alert
        type={alert.type}
        message={alert.message}
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
      />
    </>
  );
};

export default AdminPricing;
