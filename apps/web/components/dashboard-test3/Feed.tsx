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
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          Feed
          <Button size="sm" className="h-7 text-sm px-3">
            + Create Post
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="flex space-x-1.5 border-b pb-2 mb-3">
          <Button variant="secondary" size="sm" className="h-7 text-sm px-3">All</Button>
          <Button variant="ghost" size="sm" className="h-7 text-sm px-3">For you</Button>
          <Button variant="ghost" size="sm" className="h-7 text-sm px-3">Events</Button>
          <Button variant="ghost" size="sm" className="h-7 text-sm px-3">Governance</Button>
          <Button variant="ghost" size="sm" className="h-7 text-sm px-3">Trending</Button>
        </div>

        <div className="space-y-4">
          {feedItems.map((item) => (
            <div key={item.id} className="border-b pb-3 last:border-b-0 last:pb-0">
              {item.type === "Post" && (
                <div>
                  <div className="flex items-center space-x-1.5 text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400">
                    <Badge variant="default" className="text-sm py-0 px-1.5">{item.type}</Badge>
                    <span>by {item.author}</span>
                    <span>• {item.time}</span>
                    <span>• {item.topic}</span>
                    {item.platform && <span>• {item.platform}</span>}
                  </div>
                  <h3 className="mt-1.5 text-base font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-300">
                    {item.content}
                  </p>
                  <div className="flex items-center justify-between mt-2 text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400">
                    <div className="flex space-x-3">
                      <span>❤️ {item.likes}</span>
                      <span>💡 {item.ideas}</span>
                      <span>✓ {item.views}</span>
                      <span>⚡ {item.spark}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-6 text-sm px-3">💬 Discuss ({item.comments})</Button>
                  </div>
                </div>
              )}
              {item.type === "Proposal" && (
                <div>
                  <div className="flex items-center space-x-1.5 text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400">
                    <Badge variant="default" className="text-sm py-0 px-1.5">{item.type}</Badge>
                    <span>{item.status}</span>
                    <span>• {item.timeLeft}</span>
                    <span>• {item.voted}</span>
                  </div>
                  <h3 className="mt-1.5 text-base font-semibold">{item.title}</h3>
                  <div className="flex justify-end mt-2 space-x-1.5">
                    <Button size="sm" className="h-7 text-sm px-3">Vote Now</Button>
                    <Button variant="secondary" size="sm" className="h-7 text-sm px-3">View Details</Button>
                  </div>
                </div>
              )}
              {item.type === "Event" && (
                <div>
                  <div className="flex items-center space-x-1.5 text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400">
                    <Badge variant="default" className="text-sm py-0 px-1.5">{item.type}</Badge>
                    <span>{item.time}</span>
                    <span>• 📍 {item.location}</span>
                    <span>• {item.attendees} attending</span>
                  </div>
                  <h3 className="mt-1.5 text-base font-semibold">{item.title}</h3>
                  <div className="flex justify-end mt-2 space-x-1.5">
                    <Button size="sm" className="h-7 text-sm px-3">RSVP Going</Button>
                    <Button variant="secondary" size="sm" className="h-7 text-sm px-3">Details</Button>
                    <Button variant="secondary" size="sm" className="h-7 text-sm px-3">Share</Button>
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
