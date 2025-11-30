import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { industries, iconMap } from "@/lib/industries";
import type { Industry } from "@shared/schema";
import { Link } from "wouter";

export default function IndustrySelection() {

  return (
    <div className="flex flex-col h-full">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <h1 className="text-3xl font-semibold text-foreground">
            Sélectionnez votre secteur d'activité
          </h1>
          <p className="text-muted-foreground mt-2">
            L'IA adaptera la configuration HubSpot aux besoins spécifiques de votre industrie
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {industries.map((industry: Industry) => {
              const Icon = iconMap[industry.icon as keyof typeof iconMap];

              return (
                <Link key={industry.id} href={`/connect?industry=${industry.id}`}>
                  <Card
                    className="cursor-pointer transition-all hover-elevate active-elevate-2"
                    data-testid={`card-industry-${industry.id}`}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          {Icon && <Icon className="h-6 w-6" />}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{industry.name}</CardTitle>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {industry.nameEn}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{industry.description}</CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
