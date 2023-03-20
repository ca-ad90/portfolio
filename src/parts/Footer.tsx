interface FooterProps{
    name:string
}
export default function Footer(props:FooterProps){
    return(
        <div id={props.name} className="footer"></div>
    )

}
