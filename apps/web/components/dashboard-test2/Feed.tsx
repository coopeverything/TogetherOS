import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Feed() {
  const feedItems = [
    {
      id: 1,
      type: "Post",
      title: "Affordable Housing Crisis in Seattle",
      author: "Alice",
      time: "2 hours ago",
      topic: "Housing",
      content: "We need to address the growing housing affordability crisis...",
      likes: 23,
      ideas: 12,
      views: 18,
      spark: 8,
      comments: 5,
    },
    {
      id: 2,
      type: "Proposal",
      title: "Weekly Farmers Market",
      status: "Voting",
      timeLeft: "2 days left",
      voted: "67% voted",
    },
    {
      id: 3,
      type: "Event",
      title: "Community Garden Meeting",
      time: "Tomorrow, 6:00 PM",
      location: "Seattle",
      attendees: 12,
      host: "Seattle Local",
    },
    {
      id: 4,
      type: "Post",
      title: "Local Climate Action Ideas",
      author: "Bob",
      time: "Yesterday",
      topic: "Climate",
      platform: "Instagram",
      content: "Here are some practical ways we can reduce our carbon footprint...",
      likes: 45,
      ideas: 8,
      views: 32,
      spark: 15,
      comments: 12,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Feed
          <Button size="sm">
            + Create Post
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2 border-b pb-4 mb-4">
          <Button variant="secondary" size="sm">All</Button>
          <Button variant="ghost" size="sm">For you</Button>
          <Button variant="ghost" size="sm">Events</Button>
          <Button variant="ghost" size="sm">Governance</Button>
          <Button variant="ghost" size="sm">Trending</Button>
        </div>

        <div className="space-y-6">
          {feedItems.map((item) => (
            <div key={item.id} className="border-b pb-4 last:border-b-0 last:pb-0">
              {item.type === "Post" && (
                <div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <Badge variant="default">{item.type}</Badge>
                    <span>by {item.author}</span>
                    <span>• {item.time}</span>
                    <span>• {item.topic}</span>
                    {item.platform && <span>• {item.platform}</span>}
                  </div>
                  <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    {item.content}
                  </p>
                  <div className="flex items-center justify-between mt-3 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex space-x-4">
                      <span>❤️ {item.likes}</span>
                      <span>💡 {item.ideas}</span>
                      <span>✓ {item.views}</span>
                      <span>⚡ {item.spark}</span>
                    </div>
                    <Button variant="ghost" size="sm">💬 Discuss ({item.comments})</Button>
                  </div>
                </div>
              )}
              {item.type === "Proposal" && (
                <div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <Badge variant="default">{item.type}</Badge>
                    <span>{item.status}</span>
                    <span>• {item.timeLeft}</span>
                    <span>• {item.voted}</span>
                  </div>
                  <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
                  <div className="flex justify-end mt-3 space-x-2">
                    <Button size="sm">Vote Now</Button>
                    <Button variant="secondary" size="sm">View Details</Button>
                  </div>
                </div>
              )}
              {item.type === "Event" && (
                <div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <Badge variant="default">{item.type}</Badge>
                    <span>{item.time}</span>
                    <span>• 📍 {item.location}</span>
                    <span>• {item.attendees} attending</span>
                  </div>
                  <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
                  <div className="flex justify-end mt-3 space-x-2">
                    <Button size="sm">RSVP Going</Button>
                    <Button variant="secondary" size="sm">Details</Button>
                    <Button variant="secondary" size="sm">Share</Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
