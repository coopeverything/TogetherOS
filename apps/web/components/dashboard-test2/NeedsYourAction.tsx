import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function NeedsYourAction() {
  const actions = [
    { id: 1, text: "5 proposals to vote", icon: "🗳️" },
    { id: 2, text: "3 discussions need reply", icon: "💬" },
    { id: 3, text: "12 tasks overdue", icon: "⏰" },
    { id: 4, text: "2 drafts to finish", icon: "📝" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Needs Your Action</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {actions.map((action) => (
            <li key={action.id} className="flex items-center space-x-2">
              <span className="text-xl">{action.icon}</span>
              <span className="text-sm font-medium">{action.text}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
