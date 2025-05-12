import { Progress } from "@/components/ui/progress"
import type { DraftPoints } from "@/types/draft"

interface DraftHeaderProps {
  player1: string
  player2: string
  player1Points: DraftPoints
  player2Points: DraftPoints
  maxPoints: number
  timer: {
    minutes: number
    seconds: number
  }
  currentPhase: string
}

export default function DraftHeader({
  player1,
  player2,
  player1Points,
  player2Points,
  maxPoints,
  timer,
  currentPhase,
}: DraftHeaderProps) {
  const formatTime = (minutes: number, seconds: number) => {
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-between items-center">
        <div className="text-left">
          <div className="text-xl font-bold">{player1}</div>
          <div className="text-sm text-gray-400">
            {player1Points.totalPoints}/{maxPoints} pontos
          </div>
        </div>

        <div className="text-center">
          <div className="text-sm text-gray-400">{currentPhase}</div>
          <div className="text-xl font-bold">{formatTime(timer.minutes, timer.seconds)}</div>
        </div>

        <div className="text-right">
          <div className="text-xl font-bold">{player2}</div>
          <div className="text-sm text-gray-400">
            {player2Points.totalPoints}/{maxPoints} pontos
          </div>
        </div>
      </div>

      <div className="flex justify-between space-x-4">
        <Progress value={(player1Points.totalPoints / maxPoints) * 100} max={100} className="h-2 flex-1" />
        <Progress value={(player2Points.totalPoints / maxPoints) * 100} max={100} className="h-2 flex-1" />
      </div>
    </div>
  )
}
