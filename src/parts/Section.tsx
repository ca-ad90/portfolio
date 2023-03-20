interface SectionProps {
    name: string
  }
export default function Section(props:SectionProps){

    return (
        <section id={props.name}></section>
    )
}
