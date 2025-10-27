// Phase I Polish Pack: Notification template rendering
import { NotificationTemplate, TrainingCompletion, Training, User, Site, getFullName } from "@/types";
import { formatDate } from "@/lib/utils";

export function renderTemplate(
  template: NotificationTemplate,
  completion: TrainingCompletion,
  training: Training,
  user: User,
  manager?: User,
  site?: Site
): { subject: string; body: string } {
  const variables: Record<string, string> = {
    "{{employee}}": getFullName(user),
    "{{training}}": training.title,
    "{{due_date}}": formatDate(completion.dueAt),
    "{{manager}}": manager ? getFullName(manager) : "N/A",
    "{{site}}": site?.name || "N/A",
  };

  let renderedSubject = template.subject;
  let renderedBody = template.body;

  Object.entries(variables).forEach(([key, value]) => {
    renderedSubject = renderedSubject.replace(new RegExp(key, "g"), value);
    renderedBody = renderedBody.replace(new RegExp(key, "g"), value);
  });

  return {
    subject: renderedSubject,
    body: renderedBody,
  };
}

