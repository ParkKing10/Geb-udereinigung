import { USPS } from "@/lib/sauberfit-data";
import { Icon } from "./Icon";

export function UspBar() {
  return (
    <div className="sf-container">
      <div className="sf-uspbar">
        {USPS.map((u) => (
          <div className="sf-usp" key={u.title}>
            <span className="sf-usp-ic"><Icon name={u.icon} size={22} /></span>
            <div className="sf-usp-t">
              <b>{u.title}</b>
              <span>{u.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
