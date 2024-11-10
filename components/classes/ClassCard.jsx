// components/ClassCard.jsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users } from 'lucide-react';

const ClassCard = ({ classData, isTeaching }) => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardHeader className="pb-3">
      <div className="flex justify-between items-start">
        <div>
          <CardTitle className="text-lg font-bold">
            {classData.className}
          </CardTitle>
          <CardDescription>
            {classData.subject} {classData.section && `• ${classData.section}`}
          </CardDescription>
        </div>
        {isTeaching ? (
          <BookOpen className="h-5 w-5 text-muted-foreground" />
        ) : (
          <Users className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
    </CardHeader>
    <CardContent>
      {/* Only show class code if isTeaching is true */}
      {isTeaching && (
        <p className="text-sm text-muted-foreground">
          Class Code: {classData.classCode}
        </p>
      )}
      {classData.description && (
        <p className="text-sm mt-2 text-muted-foreground line-clamp-2">
          {classData.description}
        </p>
      )}
    </CardContent>
  </Card>
);

export default ClassCard;