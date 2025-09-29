declare namespace JSX {
  interface IntrinsicElements {
    svg: React.SVGProps<SVGSVGElement>;
    circle: React.SVGProps<SVGCircleElement>;
    path: React.SVGProps<SVGPathElement>;
    rect: React.SVGProps<SVGRectElement>;
    g: React.SVGProps<SVGGElement>;
    defs: React.SVGProps<SVGDefsElement>;
    linearGradient: React.SVGProps<SVGLinearGradientElement>;
    stop: React.SVGProps<SVGStopElement>;
    text: React.SVGProps<SVGTextElement>;
    line: React.SVGProps<SVGLineElement>;
    polygon: React.SVGProps<SVGPolygonElement>;
    polyline: React.SVGProps<SVGPolylineElement>;
    ellipse: React.SVGProps<SVGEllipseElement>;
  }
} 