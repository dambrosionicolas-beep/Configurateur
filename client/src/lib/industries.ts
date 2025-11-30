import { Industry } from "@shared/schema";
import {
  Building,
  ShoppingCart,
  Briefcase,
  Heart,
  DollarSign,
  Factory,
} from "lucide-react";

export const industries: Industry[] = [
  {
    id: "real-estate",
    name: "Immobilier",
    nameEn: "Real Estate",
    description: "Gestion de propriétés, transactions, clients acheteurs/vendeurs",
    icon: "Building",
    color: "blue",
  },
  {
    id: "ecommerce",
    name: "E-commerce",
    nameEn: "E-commerce",
    description: "Boutique en ligne, gestion catalogue, commandes clients",
    icon: "ShoppingCart",
    color: "purple",
  },
  {
    id: "services",
    name: "Services professionnels",
    nameEn: "Professional Services",
    description: "Conseil, agences, prestataires de services B2B",
    icon: "Briefcase",
    color: "green",
  },
  {
    id: "healthcare",
    name: "Santé",
    nameEn: "Healthcare",
    description: "Cabinets médicaux, cliniques, services de santé",
    icon: "Heart",
    color: "red",
  },
  {
    id: "finance",
    name: "Finance",
    nameEn: "Finance",
    description: "Banque, assurance, services financiers",
    icon: "DollarSign",
    color: "yellow",
  },
  {
    id: "manufacturing",
    name: "Manufacturing",
    nameEn: "Manufacturing",
    description: "Production industrielle, fabrication, distribution B2B",
    icon: "Factory",
    color: "orange",
  },
];

export const iconMap = {
  Building,
  ShoppingCart,
  Briefcase,
  Heart,
  DollarSign,
  Factory,
};
