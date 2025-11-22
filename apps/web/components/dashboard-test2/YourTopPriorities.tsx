import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function YourTopPriorities() {
  const priorities = [
    { id: 1, name: "Housing", score: 9 },
    { id: 2, name: "Climate", score: 8 },
    { id: 3, name: "Education", score: 6 },
    { id: 4, name: "Economy", score: 5 },
    { id: 5, name: "Wellbeing", score: 4 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Top Priorities</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {priorities.map((priority) => (
            <li key={priority.id} className="flex items-center justify-between">
              <span className="text-sm font-medium">{priority.name}</span>
              <Badge variant="default">{priority.score}/10</Badge>
            </li>
          ))}
        </ul>
        <div className="mt-4 text-sm text-blue-600 hover:underline">
          <a href="#">Manage Priorities &rarr;</a>
        </div>
      </CardContent>
    </Card>
  );
}
