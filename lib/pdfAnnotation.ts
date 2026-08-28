export type AnnotationType = 'highlight' | 'underline' | 'strikethrough' | 'text' | 'rectangle' | 'circle' | 'line' | 'arrow' | 'freehand';

export interface BaseAnnotation {
  id: string;
  type: AnnotationType;
  pageNumber: number;
  color: string;
  opacity: number;
  strokeWidth: number;
}

export interface RectAnnotation extends BaseAnnotation {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TextAnnotation extends BaseAnnotation {
  x: number;
  y: number;
  text: string;
  fontSize: number;
}

export interface LineAnnotation extends BaseAnnotation {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface FreehandAnnotation extends BaseAnnotation {
  points: { x: number; y: number }[];
}

export type Annotation = RectAnnotation | TextAnnotation | LineAnnotation | FreehandAnnotation;

let _idCounter = 0;
export function generateAnnotationId(): string {
  return `ann-${Date.now()}-${++_idCounter}`;
}

/**
 * Draw all annotations for a page on a canvas context.
 */
export function drawAnnotations(ctx: CanvasRenderingContext2D, annotations: Annotation[]) {
  for (const ann of annotations) {
    ctx.save();
    ctx.globalAlpha = ann.opacity;
    ctx.strokeStyle = ann.color;
    ctx.fillStyle = ann.color;
    ctx.lineWidth = ann.strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const a = ann as any;

    switch (ann.type) {
      case 'highlight':
        ctx.fillStyle = ann.color;
        ctx.globalAlpha = 0.3;
        ctx.fillRect(a.x, a.y, a.width, a.height);
        break;

      case 'underline':
        ctx.beginPath();
        ctx.moveTo(a.x, a.y + a.height);
        ctx.lineTo(a.x + a.width, a.y + a.height);
        ctx.stroke();
        break;

      case 'strikethrough':
        ctx.beginPath();
        ctx.moveTo(a.x, a.y + a.height / 2);
        ctx.lineTo(a.x + a.width, a.y + a.height / 2);
        ctx.stroke();
        break;

      case 'text':
        ctx.font = `${a.fontSize}px sans-serif`;
        ctx.fillText(a.text, a.x, a.y);
        break;

      case 'rectangle':
        ctx.strokeRect(a.x, a.y, a.width, a.height);
        break;

      case 'circle': {
        const cx = a.x + a.width / 2;
        const cy = a.y + a.height / 2;
        const rx = Math.abs(a.width / 2);
        const ry = Math.abs(a.height / 2);
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
        ctx.stroke();
        break;
      }

      case 'line':
        ctx.beginPath();
        ctx.moveTo(a.x1, a.y1);
        ctx.lineTo(a.x2, a.y2);
        ctx.stroke();
        break;

      case 'arrow': {
        const dx = a.x2 - a.x1;
        const dy = a.y2 - a.y1;
        const angle = Math.atan2(dy, dx);
        const headLen = 15;
        ctx.beginPath();
        ctx.moveTo(a.x1, a.y1);
        ctx.lineTo(a.x2, a.y2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(a.x2, a.y2);
        ctx.lineTo(a.x2 - headLen * Math.cos(angle - Math.PI / 6), a.y2 - headLen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(a.x2, a.y2);
        ctx.lineTo(a.x2 - headLen * Math.cos(angle + Math.PI / 6), a.y2 - headLen * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
        break;
      }

      case 'freehand':
        if (a.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(a.points[0].x, a.points[0].y);
          for (let i = 1; i < a.points.length; i++) {
            ctx.lineTo(a.points[i].x, a.points[i].y);
          }
          ctx.stroke();
        }
        break;
    }

    ctx.restore();
  }
}
