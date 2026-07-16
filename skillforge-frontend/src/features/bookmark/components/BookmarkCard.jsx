import ResourceCard from "@/features/resources/components/ResourceCard";

export default function BookmarkCard({ bookmark }) {
  const resource = {
    id: bookmark.resourceId,
    title: bookmark.title,
    description: bookmark.description,
    url: bookmark.url,
    type: bookmark.type,
    difficulty: bookmark.difficulty,
    estimatedMinutes: bookmark.estimatedMinutes,
    topic: {
      id: bookmark.topicId,
      name: bookmark.topicName,
    },
    tags: [],
  };

  return <ResourceCard resource={resource} />;
}
